# ee-class


    var Class = require( "ee-class" );


    var Human = new Class( {

    	  name: ""
    	, age: 29

    	, init: function( options ){
    		this.name = options.name;
    	}


    	, sayHello: function( to ){
    		console.log( "Hi %s, my name is %s and i'm %i years old.", to, this.name, this.age );
    	}
    } );



    var Boy = new Class( {
    	inherits: Human
    	, age: 12
    } );


    var fabian = new Boy( { name: "Fabian" } );
    fabian.sayHello(); // Hi my name is Fabian and i'm 12 years old.