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

Simple definition of object as module

    define( 'a', { name: 'module A' } );

Classic module definitions with dependencies and without

    define( 'a', [ 'b', 'c' ], function( b, c ) { ... } );
    define( 'b', function( require, exports, module ) { ... } );

Dependencies can be declared as a string (single dependency or list, separated by a space)

    define( 'a', 'b', function( b ) { ... } );
    define( 'b', 'c d', function( c, d ) { ... } );

A function can be defined as a module body with help of `define.asis`

    function f() {}
    
    define.asis( 'f', f );
    // or
    define( true, 'f', f );
    
    require( 'f' ) // => f
    require( [ 'f' ], function( m ) {
        // m === f
    } );
    
Empty module is correct

    jQuery( document ).ready( function() {
        define( 'domReady' );
    } );
    
    require( 'domReady', function() {
        // ...
    } );
    
Require module immediately

    var a = require( 'a' ); // returns module or throws error
    
Wait module definition

    require( [ 'a', 'b' ], function( a, b ) { ... } ); // no errors
    
    setTimeout( function() {
        define( 'a', {} );
        define( 'b', {} );
    }, 1000 );
    
Require can be called without callback or with many arguments

    require( [ 'a' ] );  // waits definition and initialize it immediately
    require( 'a', 'b' ); // equals the follwing
    require( [ 'a', 'b' ] );
    
    require( 'a', 'b', 'c', function( a, b, c ) { ... } );
    
Lazy initialization can be disabled

    define( 'a', function() {
        // this factory will not be called until the module 'a' is required
    } );

    define.lazy = false;
    
    define( 'b', function() {
        // this factory will be called immediately
    } );
    
If you enable verbose mode you can see logging of modules definitions, requires and builds in JavaScript console.

    define.verbose = true;
    
    define( 'a', function() {} );
    // >> Module "a" is defined
    require( 'a' )
    // >> Module "a" is required
    // >> Module "a" is built
    
`define.noConflict()` returns `define` function and restores previous values of global `define` and `require`.

    var d = define.noConflict();
    // window.define => undefined
    // window.require => undefined
    d( 'a', {} );
    var a = d.require( 'a' );

