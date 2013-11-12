# ee-class

Javascript Class implementation for node.js

## installation

    npm install ee-class


## build status

[![Build Status](https://travis-ci.org/eventEmitter/ee-class.png?branch=master)](https://travis-ci.org/eventEmitter/ee-class)


## usage

    var Class = require( "ee-class" );


    var LifeForm = new Class( {
        isAlive: false

        , init: function( options ){
            this.isAlive = !!options.isAlive;
        }
    } );



    var Human = new Class( {
        inherits: LifeForm
        
        , name: ""

        // pay attention to give the function a name so you can reference it when you are calling the parent function
        , init: function myInitFunction( options ){
            myInitFunction.parent( options );
            this.name = options.name;
        }
    } );



    var Boy = new Class( {
        inherits: Human

        , age: 0

        // pay attention to give the function a name so you can reference it when you are calling the parent function
        , init: function myInitFunction( options ){
            myInitFunction.parent( options );
            if ( options.age > 18 ) throw new Error( "Too old to be a boy!" )
            this.age = options.age;
        }


        , describe: function(){
            console.log( "Hi, my name is %s, i'm %s years old and i'm " + ( this.isAlive ? "alive :)" : "dead :(" ), this.name, this.age );
        }
    } );



    var fabian = new Boy( {
          name:     "fabian"
        , age:      15
        , isAlive:  true
    } );

    fabian.describe(); // Hi, my name is fabian, i'm 15 years old and i'm alive :)


# Version History

- 0.1.0: initial version
- 0.1.3: fixed integration with eventemitter objects
- 0.2.0: Added proper implementation for calling super functions, deprecated the «parent» property
- 0.2.1: Bugfix for the «super implementation»
- 0.2.2: Deprecated the «super» property and replaced it with the «parent» property beacuse super is a javascript reserved keyword