module( 'Basic' );

QUnit.testStart( function() { define.clean(); } );

asyncTest( 'lazy loading', function() {
    expect( 4 );

    define( 'a', function() { ok( false ); } );
    define( 'b', [], function() { ok( false ); } );
    define( 'b2', [ 'a' ], function() { ok( false ); } );
    define( true, 'c', function() { ok( false ); } );
    define.asis( 'd', function() { ok( false ); } );

    define( 'm1', function() {
        ok( true, 'factory 1 is called' );
    } );
    define( 'm2', [ 'm1' ], function() {
        ok( true, 'factory 2 is called' );
    } );
    define( 'm3', [ 'm2' ], function() {
        ok( true, 'factory 3 is called' );
    } );
    require( 'm3' );

    setTimeout(function() {
        ok( true, 'done' );
        start();
    }, 100);

} );

test( 'define + require', function() {

    var a = {},
        b = 3,
        c = false,
        d = [ 'a' ],
        e = function() { ok( false ); },
        f = {},
        g = function() { ok( false ); },
        h = [];

    define( 'a', a );
    strictEqual( require( 'a' ), a, 'object' );

    define.asis( 'b', b );
    strictEqual( require( 'b' ), b, 'number' );

    define( 'c', c );
    strictEqual( require( 'c' ), c, 'false' );

    define( 'd', d );
    strictEqual( require( 'd' ), d, 'array' );

    define( true, 'e', e );
    strictEqual( require( 'e' ), e, 'function' );

    define( 'f', function() { return f; } );
    strictEqual( require( 'f' ), f, 'factory' );

    define( 'g', function(require, exports, module) {
        exports.result = g;
    } );
    strictEqual( require( 'g' ).result, g, 'exports' );

    define( 'h', function(require, exports, module) {
        module.exports = h;
    } );
    strictEqual( require( 'h' ), h, 'module.exports' );

} );

test( 'define + require + callback', function() {
    expect( 3 );

    var a = {};

    define( 'a', a );
    require( [ 'a' ], function( m ) {
        strictEqual( m, a, 'object' );
    } );

    define( 'b', function() {
        return a;
    } );
    require( 'b', function( m ) {
        strictEqual( m, a, 'factory' );
    } );

    require( [ 'a', 'b' ], function( ma, mb ) {
        ok( ma === a && mb === a, 'two dependencies' );
    } );

} );

test( 'require before define', function() {
    expect( 7 );

    var a = {},
        f = true;

    require( 'a', function( m ) {
        f = false;
        strictEqual( m, a, 'module is defined' );
    } );

    ok( f, 'module A is expected' );

    define( 'a', a );

    ok( !f, 'module A is provided' );

    f = true; // reset flag

    require( 'b', function( m ) {
        f = false;
        strictEqual( m, a, 'module B is defined' );
    } );

    ok( f, 'module B is expected' );

    define( 'b', function() {
        ok( true, 'factory is called' );
        return a;
    } );

    ok( !f, 'module B is provided' );

} );

test( 'factory is called once', function() {
    expect( 8 );

    var c_a = 0, c_b = 0;
    define( 'a', function factory_a() {
        c_a++;
        return { c: c_a };
    } );
    equal( c_a, 0, 'No calls' );

    require( 'a' );
    equal( c_a, 1, 'One call after require' );

    require( [ 'a' ], function( a ) {
        ok( true, 'callback is called' );
    } );
    equal( c_a, 1, 'One call after require with callback' );

    define( 'b', [ 'a' ], function( b ) {
        c_b++;
        return { c: c_b };
    } );
    equal( c_a, 1, 'One call after other module definition' );
    equal( c_b, 0, 'No calls of other module' );

    require( 'b' );
    equal( c_a, 1, 'One call after require of other module' );
    equal( c_b, 1, 'One call of other module factory' );

} );
