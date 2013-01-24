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
				, getters = {}
				, setters = {};

			// collect properties


			return klass;
		};


		// the actual class prototype
		Class = function( classDefinition ){
			return createClass( classDefinition );
		};
		

		// exports
		module.exports = Class;
	} )();
	





	new module.exports();