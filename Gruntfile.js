module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';\n',
            },
            // all: {
            //     src: ['lib/Class.js', 'lib/EventEmitter.js'],
            //     dest: 'dist/all.js',
            // }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                sourceMap: true
            },
            Class: {
                src: 'lib/Class.js',
                dest: 'dist/Class.min.js'
            },
            EventEmitter: {
                src: 'lib/EventEmitter.js',
                dest: 'dist/EventEmitter.min.js'
            }
        },
        mochaTest: { //Node.js tests
            test: {
                options: {
                    reporter: 'spec',
                    captureFile: 'results.txt', // Optionally capture the reporter output to a file
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
                },
                src: ['test/index.js']
            }
        },
        connect: {
            test: {
                options: {
                    port: 8010,
                    keepAlive: true
                }
            }
        },
        jasmine: {  //Browser tests
            test: {
                src: 'lib/**/*.js',
                options: {
                    specs: 'test/index.js',
                    helpers: 'spec/*Helper.js'
                }
            }
        },
        bower: { //Update requirejs with bower components
            target: {
                rjsConfig: './test/requirejs-config.js'
            },
            options: {
                baseUrl: './',
                transitive: true,
                'exclude-dev': true
            }
        }
    });

    //Build
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-bower-requirejs');
    //Tests
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('default', ['cliTest', 'build']);

    grunt.registerTask('mocha', ['mochaTest']);

    grunt.registerTask('cliTest', ['jasmine', 'mochaTest']);
    grunt.registerTask('browserTest', '', function(){
        console.log("Test server can be found at:", "localhost:"+ 8010+ "/test/");
        grunt.task.run(['connect:test:keepalive']);
    });

    grunt.registerTask('test', ['cliTest', 'browserTest']);
    grunt.registerTask('build', ['bower', 'concat', 'uglify']);

};
