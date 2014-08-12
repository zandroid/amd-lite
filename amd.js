/**
 * AMD lite implementation
 * https://github.com/zandroid/amd-lite
 *
 * Copyright (c) 2014 Andrey Zaytsev
 * MIT License
 *
 */

;( function( glob, undefined ) {

"use strict";

function noop() {}

function logModuleIsBuilt( name ) {
    console.log( 'Module "' + name + ' is built' );
}

function handlePromise( promise, descriptor ) {
    var currentSession = _session;
    ( promise.done || promise.then ).call( promise, function( result ) {
        if ( currentSession === _session ) {
            descriptor.exports = result;
            if ( define.verbose ) {
                logModuleIsBuilt( descriptor.name );
            }
            _check( descriptor.name );
        }
    } );
}

var _modules = {},
    _expected = {},
    _session = Date.now();

function define( name, dependencies, module ) {
    var asis, m, thenable;

    if ( name === true ) {
        // define( asis === true, name, module );
        name = dependencies;
        dependencies = [];
        asis = true;
    }
    else if ( arguments.length < 3 ) {
        // define( name, module );
        module = dependencies;
        dependencies = undefined;
        asis = !module || typeof module !== 'function' && !module.then;
    }
    thenable = !asis && !!module.then;

    if ( typeof name !== 'string' ) {
        throw new Error( 'Module name is not a string' );
    }

    if ( name in _modules ) {
        throw new Error( 'Redefinition of module "' + name + '"' );
    }

    if ( asis || thenable ) {
        dependencies = undefined;
    }
    else if ( !Array.isArray( dependencies ) ) {
        if ( typeof dependencies === 'string' ) {
            dependencies = dependencies.split( ' ' );
        }
        else if ( dependencies === undefined ) {
            dependencies = asis ? [] : [ 'require', 'exports', 'module' ];
        }
        else {
            throw new Error( 'Dependencies argument is not an array' );
        }
    }

    m = _modules[ name ] = {
        name: name,
        dependencies: dependencies,
        thenable: thenable
    };
    if ( asis ) {
        m.exports = module;
    }
    else if ( thenable ) {
        handlePromise( module, m );
    }
    else {
        m.module = module;
    }

    if ( define.verbose ) {
        console.log( 'Module "' + name + '" is defined' );
        if ( asis ) {
            logModuleIsBuilt( name );
        }
    }

    if ( name in _expected || define.lazy === false ) {
        _build( [], m );
    }
}

function require( dependencies, callback ) {
    var m;

    if ( arguments.length === 1 && typeof dependencies === 'string' ) {
        // require( moduleName ) => module.exports or throw Error

        if ( define.verbose ) {
            console.log( 'Module "' + dependencies + '" is required' );
        }

        m = _modules[ dependencies ];
        if ( !m ) {
            throw new Error( 'Module "' + dependencies + '" is not defined' );
        }
        if ( !_build( [], m ) ) {
            throw new Error( 'Module "' + dependencies + '" cannot be built' );
        }
        return m.exports;
    }

    if ( typeof dependencies === 'string' ) {
        dependencies = Array.prototype.slice.call( arguments );
        callback = typeof dependencies[ dependencies.length - 1 ] !== 'string' ? dependencies.pop() : noop;
    }
    else if ( !Array.isArray( dependencies ) ) {
        throw new Error( 'Dependencies argument is not an array' );
    }

    if ( define.verbose ) {
        console.log( 'Modules collection [ "' + dependencies.join( '", "' ) + '" ] is required' );
    }

    if ( callback === undefined ) {
        callback = noop;
    }
    else if ( typeof callback !== 'function' ) {
        throw new Error( 'Callback argument is not a function' );
    }

    _build( [], {
        name: 'require',
        dependencies: dependencies,
        module: callback
    } );

    return undefined;
}

function _build( stack, m ) {
    var name = m.name,
        isModule = name !== 'require',
        module, deps,
        e = false;

    if ( 'exports' in m ) {
        _check( name );
        return m;
    }

    if ( m.thenable ) {
        return undefined;
    }

    if ( isModule ) {
        e = stack.indexOf( name ) > -1;
        stack = stack.concat( [ name ] );
    }

    if ( e ) {
        throw new Error( 'Cyclic dependency: ' + stack.join( ' > ' ) );
    }

    if ( define.verbose && isModule ) {
        console.log( 'Trying to build module "' + name + '", stack: ' + stack.join( ' > ' ) );
    }

    deps = [];
    module = { id: name, exports: {} };
    e = m.dependencies.every( function( depName, dep ) {
        // var dep;
        switch ( depName ) {
            case 'require':
                dep = require;
                break;
            case 'module':
                dep = module;
                break;
            case 'exports':
                dep = module.exports;
                break;
            default:
                dep = _modules[ depName ];
                if ( dep ) {
                    dep = _build( stack, dep );
                    dep = dep && dep.exports;
                }
                if ( dep === undefined ) {

                    if ( define.verbose ) {
                        console.log( isModule ? 'Module "' + name + '" awaits for "' + depName + '"' : 'Module "' + depName + '" is awaited' );
                    }

                    dep = _expected[ depName ];
                    if ( !dep ) {
                        _expected[ depName ] = {
                            targets: [ m ]
                        };
                    }
                    else if ( dep.targets.indexOf( m ) === -1 ) {
                        dep.targets.push( m );
                    }

                    return false;
                }
                break;
        }

        deps.push( dep );
        return true;
    } );

    if ( e ) {
        e = m.module.apply( module, deps );
        if ( e === undefined ) {
            e = module.exports;
        }
        if ( e && e.then ) {
            m.thenable = true;
            handlePromise( e, m );
        }
        else {
            m.exports = e;

            if ( define.verbose && isModule ) {
                logModuleIsBuilt( name );
            }

            _check( name );
            return m;
        }
    }

    return undefined;
}

function _check( name ) {
    var t;
    if ( name in _expected ) {
        t = _expected[ name ].targets;
        delete _expected[ name ];
        t.forEach( _build.bind( null, [] ) );
    }
}

define.amd = {};

define._modules = _modules;
define._expected = _expected;

define.verbose = false;

define.asis = function( name, module ) {
    define( true, name, module );
};

define.required = function( name, dependencies, module ) {
    require( [ name ] );
    define.apply( this, arguments );
};

define.clean = function() {
    define._modules = _modules = {};
    define._expected = _expected = {};
    define._session = _session = Date.now();

    if ( define.verbose ) {
        console.log( 'AMD list is clean' );
    }
};

define.require = require;

glob.AMD = {
    define: define,
    require: require,
    namespace: function( obj ) {
        obj = obj || {};
        obj.define = define;
        obj.require = require;
    }
};

} )( this );