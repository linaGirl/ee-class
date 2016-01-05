(function() {
    'use strict';

    let Class = require('../');
    let assert = require('assert');



    let LifeForm = new Class({
          inherits: Array
        
        , isAlive: false
        , age: 0
        , name: 'nope'


        , init: function(options) {
            this.isAlive = !!options.isAlive;
            this.age = options.age;         
            this.name = options.name;
        }
    });




    let Human = new Class({
        inherits: LifeForm
        

        , test: function() {
            console.log('base was called');
        }


        , callMe: function callMe() {
            this.test();
        }

        , init: function human( options ){          
            human.super.call(this, options);
        }
    });



    let Boy = new Class({
        inherits: Human


        , test: function() {
            console.log('boy was called');
        }


        , callMe: function callMe() {
            callMe.super.call(this);
        }


        , init: function boy(options) {
            boy.super.call(this, options);
        }


        , describe: function(){
            //console.log( "Hi, my name is %s, i'm %s years old and i'm " + ( this.isAlive ? "alive :)" : "dead :(" ), this.name, this.age );
            assert.equal( this.age, 15, "The «age» property was not set!");
            assert.equal( this.name, "fabian", "The «fabian» property was not set!");
            assert.equal( this.isAlive, true, "The «alive» property was not set!");
        }
    });



    module.exports = Boy;
})();
