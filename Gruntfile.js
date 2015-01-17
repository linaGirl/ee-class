module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            lib: {
                files: [
                    {expand: true, src: ['./lib/*'], dest: 'dist/', filter: 'isFile', flatten: true}
                ]
            }
        },
        concat: {
            options: {
                separator: ';\n',
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */',
                sourceMap: true,
                preserveComments: false,
                mangle: true,
                compress: {
                    sequences     : true,  // join consecutive statemets with the “comma operator”
                    properties    : true,  // optimize property access: a["foo"] → a.foo
                    dead_code     : false,  // discard unreachable code
                    drop_debugger : true,  // discard “debugger” statements
                    unsafe        : false, // some unsafe optimizations (see below)
                    conditionals  : true,  // optimize if-s and conditional expressions
                    comparisons   : true,  // optimize comparisons
                    evaluate      : true,  // evaluate constant expressions
                    booleans      : true,  // optimize boolean expressions
                    loops         : true,  // optimize loops
                    unused        : false,  // drop unused variables/functions
                    hoist_funs    : true,  // hoist function declarations
                    hoist_vars    : false, // hoist variable declarations
                    if_return     : true,  // optimize if-s followed by return/continue
                    join_vars     : true,  // join var declarations
                    cascade       : true,  // try to cascade `right` into `left` in sequences
                    side_effects  : true,  // drop side-effect-free statements
                    warnings      : true,  // warn about potentially dangerous optimizations/code
                    global_defs   : {}     // global definitions
                }
            },
            Class: {
                src: 'dist/Class.js',
                dest: 'dist/Class.min.js'
            },
            EventEmitter: {
                src: 'dist/EventEmitter.js',
                dest: 'dist/EventEmitter.min.js'
            },
            Namespace: {
                src: 'dist/Namespace.js',
                dest: 'dist/Namespace.min.js'
            },
            ReferenceObject: {
                src: 'dist/ReferenceObject.js',
                dest: 'dist/ReferenceObject.min.js'
            },
            Collection: {
                src: 'dist/Collection.js',
                dest: 'dist/Collection.min.js'
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
                src: [
                    'lib/**/*.js'
                ],
                options: {
                    banner: '<a href="./coverage/">Coverage</a>\n',
                    specs: 'test/index.js',
                    helpers: 'spec/*Helper.js',
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'test/coverage/coverage.json',
                        report: [
                            {type: 'html', options: {dir: 'test/coverage'}},
                            {type: 'lcov', options: {dir: 'test/coverage/lcov-report'}},
                            {type: 'cobertura', options: {dir: 'test/coverage/cobertura'}},
                            {type: 'text-summary'}
                        ],
                        thresholds: {
                            lines: 70,
                            statements: 70,
                            branches: 50,
                            functions: 75
                        }
                    }
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
    grunt.loadNpmTasks('grunt-contrib-copy');
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
    grunt.registerTask('build', ['bower', 'copy', 'concat', 'uglify']);

};
