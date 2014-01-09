module( 'Error' );

test( 'bad arguments', function() {

    throws( function() {
        define( {}, {} );
    }, 'bad id' );

    throws( function() {
        define( 'a', {}, {} );
    }, 'bad dependencies' );

} );

test( 'duplicate definition', function() {

    define( 'a', {} );

    throws( function() {
        define( 'a', function() {} );
    } );

} );

test( 'try require not defined module', function() {

    define( 'a', {} );

    throws( function() {
        require( 'b' );
    } );
} );
