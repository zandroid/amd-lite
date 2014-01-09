module.exports = function( grunt ) {

    grunt.initConfig( {
        pkg: grunt.file.readJSON( 'package.json' ),
        uglify: {
            options: {
                banner: grunt.file.read( 'banner' )
            },
            build: {
                src: 'amd.js',
                dest: 'amd.min.js'
            }
        },
        jshint: {
            all: [ 'amd.js' ]
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks( 'grunt-contrib-jshint' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );

    // Default task(s).
    grunt.registerTask( 'default', [ 'uglify' ] );

};