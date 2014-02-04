module( 'Declaration' );

test( 'main functions are defined', function() {

    ok( typeof define === 'function', '"define" is function' );
    ok( typeof define.amd === 'object', '"define.amd" is object' );

    ok( typeof require === 'function', '"require" is function' );
    ok( define.require === require, '"require" is synonym of "define.require"' );

    ok( typeof define.asis === 'function', '"define.asis" ia function' );
    ok( typeof define.clean === 'function', '"define.clean" ia function' );

} );

asyncTest( 'require/exports/module are passed as arguments if no dependencies', function() {
    expect( 5 );

    define( 'a', function( require, exports, module ) {

        strictEqual( require, define.require, '"require" is "require"' );

        deepEqual( exports, {}, '"exports" is empty object' );

        equal( typeof module, 'object', '"module" is object' );
        equal( module.id, 'a', '"module.id" is correct' );
        strictEqual( module.exports, exports, '"module.exports" is "exports"' );

        start();

    } );

    require( 'a' );

} );

asyncTest( 'require/exports/module are passed as arguments if required as dependencies', function() {
    expect( 5 );

    define( 'b', [ 'module', 'require', 'exports' ], function( module, require, exports ) {

        strictEqual( require, define.require, '"require" is "require"' );

        deepEqual( exports, {}, '"exports" is empty object' );

        equal( typeof module, 'object', '"module" is object' );
        equal( module.id, 'b', '"module.id" is correct' );
        strictEqual( module.exports, exports, '"module.exports" is "exports"' );

        start();

    } );

    require( 'b' );

} );

test( 'clean works', function() {

    define( 'toBeClean', {} );
    define.clean();
    var e = true;
    for (var key in define._modules ) {
        e = false;
    }
    ok( e, 'no modules are found' );
    throws( function() {
        e = require( 'toBeClean' );
    }, 'require(id) is broken' );

} );
