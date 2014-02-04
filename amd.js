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

var _modules = {},
    _expected = {};

function define( name, dependencies, module ) {
    var asis, m;

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
        asis = typeof module !== 'function';
    }

    if ( typeof name !== 'string' ) {
        throw new Error( 'Module name is not a string' );
    }

    if ( name in _modules ) {
        throw new Error( 'Redefinition of module "' + name + '"' );
    }

    if ( !Array.isArray(dependencies) ) {
        if ( typeof dependencies === 'string' ) {
            dependencies = dependencies.split(' ');
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
        dependencies: dependencies
    };
    m[ asis ? 'exports' : 'module' ] = module;

    if ( define.verbose ) {
        console.log( 'Module "' + name + '" is defined' );
        if ( asis ) {
            console.log( 'Module "' + name + '" is built' );
        }
    }

    // look promises
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
        return m;
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
        m.exports = e !== undefined ? e : module.exports;

        if ( define.verbose && isModule ) {
            console.log( 'Module "' + name + ' is built' );
        }

        if ( name in _expected ) {
            e = _expected[ name ].targets;
            e.forEach( _build.bind( null, [] ) );
            delete _expected[ name ];
        }

        return m;
    }

    return undefined;
}

define.amd = {};

define._modules = _modules;
define._expected = _expected;

define.verbose = false;

define.asis = function( name, module ) {
    define( true, name, module );
};

define.clean = function() {
    define._modules = _modules = {};
    define._expected = _expected = {};

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