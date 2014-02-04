JavaScript AMD lite
===================

AMD lite implementation

Restrictions
------------

 * Static dependencies only, no module loading
 * Absolute module id paths only
 * Named modules only
 * Acyclic dependencies only
 * No CommonJS support
 * ES5

Features
--------

 * Optional arguments
 * Smart arguments handling
 * Any object as module body (Object, Number, Null, Function, etc.)
 * Support 'require', 'exports' and 'module' as dependencies
 * Lazy modules initialization and not lazy mode
 * Arguments validation (detailed errors)
 * Verbose mode
 
Usage
-----

Initially both methods `define` and `require` are declared as a part of the `AMD` namespace.
But you can import them into any object with help of the `namespace` method.

    // usage of default namespace
    AMD.define( 'm', factory );
    var m = AMD.require( 'm' );

    // import functions to custom namespace
    var app = {};
    AMD.namespace( app );
    app.define( 'm', factory );

    // import functions to the global scope
    AMD.namespace( window );
    define( 'm', factory );

Simple definition of object as module

    define( 'a', { name: 'module A' } );

Classic module definitions with and without dependencies

    define( 'a', [ 'b', 'c' ], function( b, c ) { ... } );
    define( 'b', function( require, exports, module ) { ... } );

Dependencies can be declared as a string (single dependency or space separated list)

    define( 'a', 'b', function( b ) { ... } );
    define( 'b', 'c d', function( c, d ) { ... } );

Function can be defined as a module body using `define.asis`

    function f() {}
    
    define.asis( 'f', f );
    // or
    define( true, 'f', f );
    
    require( 'f' ) // => f
    require( [ 'f' ], function( m ) {
        // m === f
    } );
    
You can define an empty module

    jQuery( document ).ready( function() {
        define( 'domReady' );
    } );
    
    require( 'domReady', function() {
        // ...
    } );
    
Require module immediately

    var a = require( 'a' ); // returns module or throws error
    
Delayed module definition

    require( [ 'a', 'b' ], function( a, b ) { ... } ); // no errors
    
    setTimeout( function() {
        define( 'a', {} );
        define( 'b', {} );
    }, 1000 );
    
`require` can be called without the callback parameter or with multiple arguments

    require( [ 'a' ] );  // waits for the module definition and initializes it immediately
    require( 'a', 'b' ); // equals to the following
    require( [ 'a', 'b' ] );
    
    require( 'a', 'b', 'c', function( a, b, c ) { ... } ); // it works
    
Lazy (default) and eager module initialization modes

    define( 'a', function() {
        // this factory will not be called until module 'a' is required
    } );

    define.lazy = false;
    
    define( 'b', function() {
        // this factory will be called immediately
    } );
    
Enable verbose mode to trace definitions, requires and builds in JavaScript console

    define.verbose = true;
    
    define( 'a', function() {} );
    // >> Module "a" is defined
    require( 'a' );
    // >> Module "a" is required
    // >> Module "a" is built
