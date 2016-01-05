(function() {
    'use strict';

    let assert = require('assert');


    let LifeForm = class extends Array {
        
        constructor(options) {
            super();

            this.isAlive = !!options.isAlive;
            this.age = options.age;         
            this.name = options.name;
        }
    };


    LifeForm.prototype.isAlive = false;
    LifeForm.prototype.age = 0;
    LifeForm.prototype.name = 'nope';




    let Human = class extends LifeForm {        

        test() {
            console.log('base was called');
        }


        callMe() {
            this.test();
        }


        constructor(options) {          
            super(options);
        }
    };




    let Boy = class extends Human {


        test() {
            console.log('boy was called');
        }


        callMe() {
            super.callMe();
        }


        constructor(options) {
            super(options);
        }


        describe() {
            //console.log( "Hi, my name is %s, i'm %s years old and i'm " + ( this.isAlive ? "alive :)" : "dead :(" ), this.name, this.age );
            assert.equal( this.age, 15, "The «age» property was not set!");
            assert.equal( this.name, "fabian", "The «fabian» property was not set!");
            assert.equal( this.isAlive, true, "The «alive» property was not set!");
        }
    };



    module.exports = Boy;
})();
