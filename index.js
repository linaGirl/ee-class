	"use strict";


	( function(){
		var Class, createClass;

		// property cloner
		var clone = function( input ){

		}
		
		
		// class contructor
		createClass = function( classDefinition ){
			var proto = Object.create( classDefinition && classDefinition.inherits ? classDefinition.inherits : Class )
				, properties = {}
				, klass;

			// collect properties

			return function(){
				var instance = Object.create( proto, clone( properties ) );
			};
		};


		// the actual class prototype
		Class = function( classDefinition ){
			return createClass( classDefinition );
		};
		

		// exports
		module.exports = Class;
	} )();
	


	var Class = module.exports;


	console.log( ( new ( new Class( {} ) )() ) instanceof Class )
	console.log( ( Object.create( {} ) ) instanceof {} )