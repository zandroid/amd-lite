module( 'Dependencies' );

asyncTest( 'queue', function() {
    expect( 1 );

    var calls = [];

    define( 'a', function() {
        calls.push( 'a' );
        return {};
    } );

    define( 'b', [ 'a' ], function() {
        calls.push( 'b' );
        return {};
    } );

    define( 'c', [ 'a', 'b' ], function() {
        calls.push( 'c' );
        return {};
    } );

    require( 'c', function() {
        deepEqual( calls, [ 'a', 'b', 'c' ], 'expected factories calls' );
        start();
    } );

} );

asyncTest( 'wait dependencies without errors', function() {
    expect( 4 );

    var _a = { id: 'a' },
        _b = { id: 'b' },
        calls = [];

    define( 'a', [ 'b' ], function( b ) {
        calls.push( 'a' );
        ok( true, 'factory a is called' );
        strictEqual( b, _b, 'module "b" is provided' );
        return _a;
    } );

    require( [ 'a' ], function( a ) {
        strictEqual( a, _a, 'module "a" is provided' );
    } );

    define( 'b', function() {
        calls.push( 'b' );
        return _b;
    } );

    setTimeout( function() {
        deepEqual( calls, [ 'b', 'a' ], 'expected factories calls' );
        start();
    }, 100 );

} );

asyncTest( 'async module definitions', function() {
    expect( 4 );

    var _a = {},
        _b = {},
        _c = {},
        _d = {};

    require( [ 'a', 'b', 'c' ], function( a, b, c ) {
        start();
    } );

    define( 'a', [ 'd' ], function( d ) {
        ok( d === _d, 'factory "a" is called' );
        return _a;
    } );

    define( 'e', [ 'd' ], function() {
        ok( false, 'factory "e" should not be called' );
        return {};
    } );

    define( 'd', [ 'c', 'b' ], function( c, b ) {
        ok( c === _c && b === _b, 'factory "d" is called' );
        return _d;
    } );

    setTimeout( function() {
        define( 'b', function() {
            ok( true, 'factory "b" is called' );
            return _b;
        } );
    }, 100);

    define( 'c', function() {
        ok( true, 'factory "c" is called' );
        return _c;
    } );

} );

asyncTest( 'define dependencies with a string value', function() {
    expect( 3 );

    var _a = {},
        _b = {},
        _c = {};

    define( 'a', 'b', function( b ) {
        ok( b === _b, 'factory "a" is called' );
        return _a;
    } );

    define( 'b', _b );

    define( 'c', 'a b', function( a, b ) {
        ok( a === _a && b === _b, 'factory "c" is called' );
        return _c;
    } );

    require( 'c', function( c ) {
        ok( c === _c, 'done' );
        start();
    } );

} );

asyncTest( 'require arguments', function() {
    expect( 4 );

    var _a = {},
        _b = {},
        _c = {};

    define( 'a', function() {
        ok( true, 'factory "a" is called' );
        return _a;
    } );
    define( 'b', function() {
        ok( true, 'factory "b" is called' );
        return _b;
    } );
    define( 'c', function() {
        ok( true, 'factory "c" is called' );
        return _c;
    } );

    require( 'a', 'b' ); // no errors
    require( 'a', 'b', 'c', function( a, b, c ) {
        ok( a === _a && b === _b && c === _c, 'all modules loaded' );
        start();
    } );

} );

asyncTest( 'cyclic dependencies', function() {
    expect( 2 );

    function notCalled() { ok( false ); }

    define( 'a', [ 'b' ], notCalled );
    define( 'b', [ 'a' ], notCalled );
    throws( function() {
        require( 'b' );
    }, /cyclic/i, 'cyclic dependencies detected on require' );

    define( 'c', [ 'd' ], notCalled );
    define( 'd', [ 'e', 'f' ], notCalled );
    define( 'f', {} );
    require( 'c', notCalled );
    throws( function() {
        define( 'e', [ 'c' ], notCalled );
    }, /cyclic/i, 'cyclic dependencies detected on define' );

    setTimeout( start, 100 );

} );