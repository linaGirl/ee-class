# ee-class

__not yet finished__

javascript class implementation, features:
- inheritance
- read only prooperties
- private properties
- getters / setters


tested on node.js v0.8.x


	var User = Class( {
		  __name: "" 					// i'm private
		, _id: { enumerable: true }		// custom defined property
		, gender: "m" 					// i'm public, enumerable, writable
		, $banned: true 				// i'm public, readonly -> access via obj.banned
		, $$dbConnection: db 			// shared property by _all_ instances of the class ( stored on the prototype, overwriting it will overwrite obly the local instance )

		, set name(){
			console.log( "you are not allowed to change the name!" );
		}

		, get name(){
			return this.__name;
		}

		, init: function( options ){
			this.__name = options.name;
		}

		, sayHi: function(){
			console.log( "my name is", this.__name );
		}
	} );


	var EEClassUser = Class( {
		inherits: User

		, isEEClassUser: true

		, init: function( options ){
			this.parent.init( options );
		}
	} );


	var michael = new EEClassUser( { name: "michael" } );

	michael.sayHi(); // my name is michael
	console.log( michael.name ); // michael
	console.log( michael.__name ); // access violation