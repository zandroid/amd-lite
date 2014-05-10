module( 'Promises' );

asyncTest( 'Support native Promise that will be resolved', function() {
    expect( 4 );
    
    var a = {},
        p;
    
    define( 'a', new Promise( function( resolve, reject ) {
        p = {
            resolve: resolve,
            reject: reject
        };
    } ) );
    
    throws( function() {
        require( 'a' );
    }, /cannot be built/, 'Module cannot be built' );
    
    require( 'a', function( m ) {
        strictEqual( a, m, 'Module is loaded' );
    } );
    
    setTimeout( function() {
        throws( function() {
            require( 'a' );
        }, /cannot be built/, 'Module cannot be built (2)' );

        p.resolve( a );
    }, 100 );

    setTimeout( function() {
        strictEqual( a, require( 'a' ), 'Module is loaded (2)' );

        start();
    }, 200 );
} );

asyncTest( 'Support native Promise that will be rejected', function() {
    expect( 2 );
    
    var a = {},
        p;
    
    define( 'a', new Promise( function( resolve, reject ) {
        p = {
            resolve: resolve,
            reject: reject
        };
    } ) );
    
    throws( function() {
        require( 'a' );
    }, /cannot be built/, 'Module cannot be built' );
    
    require( 'a', function( m ) {
        strictEqual( a, m, 'Module is loaded' );
    } );
    
    p.reject( a );
        
    setTimeout( function() {
        throws( function() {
            require( 'a' );
        }, /cannot be built/, 'Module cannot be built (2)' );
        
        start();
    }, 100 );
} );

asyncTest( 'Support native Promise that was be resolved', function() {
    expect( 1 );
    
    var a = {};
    
    define( 'a', Promise.resolve( a ) );

    setTimeout( function() {
        strictEqual( a, require( 'a' ), 'Module is loaded' );

        start();
    }, 100 );
} );

asyncTest( 'Support native Promise that was be rejected', function() {
    expect( 2 );
    
    var a = {};
    
    define( 'a', Promise.reject( a ) );
    
    throws( function() {
        require( 'a' );
    }, /cannot be built/, 'Module cannot be built' );
    
    setTimeout( function() {
        throws( function() {
            require( 'a' );
        }, /cannot be built/, 'Module cannot be built (2)' );

        start();
    }, 100 );
} );

test( 'Support thenable object', function() {
    expect( 1 );
    
    var t = {
            then: function( done, fail ) {
                ok( typeof done === 'function', '"then" is called' );
            }
        };
    
    define( 'a', t );
} );

test( 'Support thenable object that contains "done" method', function() {
    expect( 1 );
    
    var t = {
            then: function( done, fail ) {
                ok( false, '"then" should not be called' );
            },
            done: function( callback ) {
                ok( typeof callback === 'function', '"done" is called' );
            }
        };
    
    define( 'a', t );
} );

asyncTest( 'Support promise returned from factory', function() {
    expect( 4 );

    var a = {}, p = {};

    define( 'a', function() {
        return new Promise( function( resolve, reject ) {
            p.resolve = resolve;
            p.reject = reject;
        } );
    } );

    throws( function() {
        require( 'a' );
    }, /cannot be built/, 'Module cannot be built' );

    require( 'a', function( m ) {
        strictEqual( a, m, 'Module is loaded' );
    } );

    setTimeout( function() {
        throws( function() {
            require( 'a' );
        }, /cannot be built/, 'Module cannot be built (2)' );
        p.resolve( a );
    }, 100 );

    setTimeout( function() {
        strictEqual( a, require( 'a' ), 'Module is loaded (2)' );
        start();
    }, 200 );
} );
