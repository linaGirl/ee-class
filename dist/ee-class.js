(function(root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD
        
        define([], factory);
    } else if (typeof module === 'object' && typeof module.exports === 'object') {
        // Node

        module.exports = factory();
    } else {
        // EE Namespace

        // create namespace as needed
        if (typeof root.ee !== 'object') root.ee = {};

        // publish
        root.ee.Class = factory();
    }
})(this, function() {
    'use strict';


    var   setSuper
        , setSuperPrototype
        , Class;


    // set the super method on each method which is used to call the next method of the same name in the prototype chain
    setSuper = function(name, base, proto, parent) {
        base.super = function() {
            var args, i, l;

            if (base.___super) {
                args = [];

                // convert args into an arry in order
                for (i = 0, l = arguments.length; i < l; i++) args.push(arguments[i]);

                // call super
                return base.___super.apply(this, args);
            }
            else throw new Error('The method «'+name+'» has no super «'+name+'» method on any protoype!');
        };


        // makes the local class definnition available to the parent scope
        if (!base.local) Object.defineProperty(base, 'local', {value: parent});

        if (proto && proto.prototype) setSuperPrototype(name, base, proto.prototype, parent);
    };


    // find the next method with the same name on the protoype chain
    setSuperPrototype = function(name, base, proto, parent) {

        // makes the local class definnition available to the parent scope
        if (!base.local) Object.defineProperty(base, 'local', {value: parent});


        if (proto) {
            if (Object.hasOwnProperty.call(proto, name)){
                Object.defineProperty(base, '___super', {value: proto[name]});
            }
            else if (!proto.___isEeClass && name === 'init' && typeof proto === 'object' && typeof proto.constructor === 'function') {
                // a plain js object ... set it as super to the init constructor
                Object.defineProperty(base, '___super', {value: proto.constructor});
            }
            else {
                setSuperPrototype(name, base, typeof proto === 'object' ? Object.getPrototypeOf(proto) : null, parent);
            }
        }
    };



    Class = function(classDefinition) {
        var   properties = {}
            , classConstructor;

        // not creating a class, creating a property descriptor insted
        if (!(this instanceof Class)) {
            return Object.create(Class, {value:{value: classDefinition, enumerable: true}});
        }


        // get properties from super class definition
        if (classDefinition.inherits && classDefinition.inherits.___properties) properties = classDefinition.inherits.___properties;

        // collect all properties
        Object.keys(classDefinition).forEach(function(key){
            var property = classDefinition[key];

            // inherits from another class / prototype
            if (key === 'inherits') return;

            // map as method
            else if (typeof property === 'function') {
                properties[key] = {value: property, enumerable: key[0] !== '_'};

                // this may be used to build more meaningful stack traces
                if (!properties[key].value.displayName)  Object.defineProperty(properties[key].value, 'displayName', {value: key});

                // check if there is an super method to call on any of the prototypes
                setSuper(key, property, classDefinition.inherits, classDefinition);
            }

            // more analytics required
            else if (typeof property === 'object' && Object.prototype.toString.call(property) === '[object Object]') {

                // property descriptor
                if (Object.hasOwnProperty.call(property, 'get') || Object.hasOwnProperty.call(property, 'value') || Object.hasOwnProperty.call(property, 'set')) {
                    if (!Object.keys(property).some(function(key){ return ['get', 'set', 'value', 'enumerable', 'writable', 'configurable'].indexOf(key) === -1;})) {
                        // there ar eno other keys on the obejct, we should expect a definition herre

                        properties[key] = property;

                        if (typeof property.value === 'function') {
                            setSuper(key, property.value, classDefinition.inherits, classDefinition);

                            // this may be used to build more meaningful stack traces
                            if (!property.value.displayName) Object.defineProperty(property.value, 'displayName', {value: key});
                        }
                    }
                    else {
                        properties[key] = properties[key] = {value: property, enumerable: true, writable: true};
                    }
                }
                else {
                    properties[key] = properties[key] = {value: property, enumerable: true, writable: true};
                }
            }

            // map as scalar property
            else properties[key] = {value: property, enumerable: true, writable: true};
        });


        // check for es6 features
        if (typeof Symbol === 'function' && Symbol.iterator in classDefinition) properties[Symbol.iterator] = {value: classDefinition[Symbol.iterator], writable: true};





        // constructor function that is returned
        // to the user
        classConstructor = function(){
            var   args = []
                , result, i, l;


            // check if the new keyword was forgotten
            if (!(this instanceof classConstructor)) throw new Error('the class constructor was called without the «new» keyword!');

            // convert args into an arry in order
            for (i = 0, l = arguments.length; i < l; i++) args.push(arguments[i]);


            // check if the class got a constructor method
            if (this.init) result = this.init.apply(this, args);

            // or we inherited from a constructor
            else if (typeof classDefinition.inherits === 'function') classDefinition.inherits.apply(this, args);


            // we return anything we got from the constructor as result
            if (typeof result !== 'undefined') return result;
        };




        // set constructor prototype
        classConstructor.prototype = Object.create(classDefinition.inherits ? (classDefinition.inherits.prototype ? classDefinition.inherits.prototype : classDefinition.inherits) : {}, properties);

        // identify as ee class using the init function as its contructor
        Object.defineProperty(classConstructor.prototype, '___isEeClass', {value:true});

        return classConstructor;
    };




    // set enumerable property
    Class.Enumerable = function() {
        Object.defineProperty(this, 'enumerable', {value: true, enumerable: true});
        return this;
    };

    // set configurable property
    Class.Configurable = function() {
        Object.defineProperty(this, 'configurable', {value: true, enumerable: true});
        return this;
    };

    // set writable property
    Class.Writable = function() {
        Object.defineProperty(this, 'writable', {value: true, enumerable: true});
        return this;
    };

    // return the class prototype
    Class.proto = function(instance) {
        return typeof instance === 'object' ? Object.getPrototypeOf(instance) : undefined;
    };

    // return all enumerable key of the class an its prototypes
    Class.keys = function(instance) {
        var keys = [];
        for (var key in instance) keys.push(key);
        return keys;
    };

    // define a proeprty on an objetc
    Class.define = function(instance, property, descriptor){
        Object.defineProperty(instance, property, descriptor);
    };

    // implement a class on an object
    Class.implement = function(source, target) {
        Class.keys(source).forEach(function(key){
            target[key] = source[key];
        });

        return target;
    };

    // list all methods of a class
    Class.inspect = function(obj, description) {
        description = description || {};

        Object.getOwnPropertyNames(obj).sort().forEach(function(name) {
            if (typeof obj[name] === 'function') {
                description[name] = function(){};
            }
            else if (name !== '___isEeClass') {
                description[name] = obj[name];
            }
        });

        if (Object.getPrototypeOf(obj)) {
            description.super = {};
            Class.inspect(Object.getPrototypeOf(obj), description.super);
        }

        return description;
    };


    return Class;
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNsYXNzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJlZS1jbGFzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbihyb290LCBmYWN0b3J5KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICAvLyBBTURcbiAgICAgICAgXG4gICAgICAgIGRlZmluZShbXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vIE5vZGVcblxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBFRSBOYW1lc3BhY2VcblxuICAgICAgICAvLyBjcmVhdGUgbmFtZXNwYWNlIGFzIG5lZWRlZFxuICAgICAgICBpZiAodHlwZW9mIHJvb3QuZWUgIT09ICdvYmplY3QnKSByb290LmVlID0ge307XG5cbiAgICAgICAgLy8gcHVibGlzaFxuICAgICAgICByb290LmVlLkNsYXNzID0gZmFjdG9yeSgpO1xuICAgIH1cbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuXG4gICAgdmFyICAgc2V0U3VwZXJcbiAgICAgICAgLCBzZXRTdXBlclByb3RvdHlwZVxuICAgICAgICAsIENsYXNzO1xuXG5cbiAgICAvLyBzZXQgdGhlIHN1cGVyIG1ldGhvZCBvbiBlYWNoIG1ldGhvZCB3aGljaCBpcyB1c2VkIHRvIGNhbGwgdGhlIG5leHQgbWV0aG9kIG9mIHRoZSBzYW1lIG5hbWUgaW4gdGhlIHByb3RvdHlwZSBjaGFpblxuICAgIHNldFN1cGVyID0gZnVuY3Rpb24obmFtZSwgYmFzZSwgcHJvdG8sIHBhcmVudCkge1xuICAgICAgICBiYXNlLnN1cGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgYXJncywgaSwgbDtcblxuICAgICAgICAgICAgaWYgKGJhc2UuX19fc3VwZXIpIHtcbiAgICAgICAgICAgICAgICBhcmdzID0gW107XG5cbiAgICAgICAgICAgICAgICAvLyBjb252ZXJ0IGFyZ3MgaW50byBhbiBhcnJ5IGluIG9yZGVyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuXG4gICAgICAgICAgICAgICAgLy8gY2FsbCBzdXBlclxuICAgICAgICAgICAgICAgIHJldHVybiBiYXNlLl9fX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBtZXRob2QgwqsnK25hbWUrJ8K7IGhhcyBubyBzdXBlciDCqycrbmFtZSsnwrsgbWV0aG9kIG9uIGFueSBwcm90b3lwZSEnKTtcbiAgICAgICAgfTtcblxuXG4gICAgICAgIC8vIG1ha2VzIHRoZSBsb2NhbCBjbGFzcyBkZWZpbm5pdGlvbiBhdmFpbGFibGUgdG8gdGhlIHBhcmVudCBzY29wZVxuICAgICAgICBpZiAoIWJhc2UubG9jYWwpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiYXNlLCAnbG9jYWwnLCB7dmFsdWU6IHBhcmVudH0pO1xuXG4gICAgICAgIGlmIChwcm90byAmJiBwcm90by5wcm90b3R5cGUpIHNldFN1cGVyUHJvdG90eXBlKG5hbWUsIGJhc2UsIHByb3RvLnByb3RvdHlwZSwgcGFyZW50KTtcbiAgICB9O1xuXG5cbiAgICAvLyBmaW5kIHRoZSBuZXh0IG1ldGhvZCB3aXRoIHRoZSBzYW1lIG5hbWUgb24gdGhlIHByb3RveXBlIGNoYWluXG4gICAgc2V0U3VwZXJQcm90b3R5cGUgPSBmdW5jdGlvbihuYW1lLCBiYXNlLCBwcm90bywgcGFyZW50KSB7XG5cbiAgICAgICAgLy8gbWFrZXMgdGhlIGxvY2FsIGNsYXNzIGRlZmlubml0aW9uIGF2YWlsYWJsZSB0byB0aGUgcGFyZW50IHNjb3BlXG4gICAgICAgIGlmICghYmFzZS5sb2NhbCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KGJhc2UsICdsb2NhbCcsIHt2YWx1ZTogcGFyZW50fSk7XG5cblxuICAgICAgICBpZiAocHJvdG8pIHtcbiAgICAgICAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgbmFtZSkpe1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiYXNlLCAnX19fc3VwZXInLCB7dmFsdWU6IHByb3RvW25hbWVdfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghcHJvdG8uX19faXNFZUNsYXNzICYmIG5hbWUgPT09ICdpbml0JyAmJiB0eXBlb2YgcHJvdG8gPT09ICdvYmplY3QnICYmIHR5cGVvZiBwcm90by5jb25zdHJ1Y3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIC8vIGEgcGxhaW4ganMgb2JqZWN0IC4uLiBzZXQgaXQgYXMgc3VwZXIgdG8gdGhlIGluaXQgY29uc3RydWN0b3JcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYmFzZSwgJ19fX3N1cGVyJywge3ZhbHVlOiBwcm90by5jb25zdHJ1Y3Rvcn0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0U3VwZXJQcm90b3R5cGUobmFtZSwgYmFzZSwgdHlwZW9mIHByb3RvID09PSAnb2JqZWN0JyA/IE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90bykgOiBudWxsLCBwYXJlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuXG5cbiAgICBDbGFzcyA9IGZ1bmN0aW9uKGNsYXNzRGVmaW5pdGlvbikge1xuICAgICAgICB2YXIgICBwcm9wZXJ0aWVzID0ge31cbiAgICAgICAgICAgICwgY2xhc3NDb25zdHJ1Y3RvcjtcblxuICAgICAgICAvLyBub3QgY3JlYXRpbmcgYSBjbGFzcywgY3JlYXRpbmcgYSBwcm9wZXJ0eSBkZXNjcmlwdG9yIGluc3RlZFxuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ2xhc3MpKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZShDbGFzcywge3ZhbHVlOnt2YWx1ZTogY2xhc3NEZWZpbml0aW9uLCBlbnVtZXJhYmxlOiB0cnVlfX0pO1xuICAgICAgICB9XG5cblxuICAgICAgICAvLyBnZXQgcHJvcGVydGllcyBmcm9tIHN1cGVyIGNsYXNzIGRlZmluaXRpb25cbiAgICAgICAgaWYgKGNsYXNzRGVmaW5pdGlvbi5pbmhlcml0cyAmJiBjbGFzc0RlZmluaXRpb24uaW5oZXJpdHMuX19fcHJvcGVydGllcykgcHJvcGVydGllcyA9IGNsYXNzRGVmaW5pdGlvbi5pbmhlcml0cy5fX19wcm9wZXJ0aWVzO1xuXG4gICAgICAgIC8vIGNvbGxlY3QgYWxsIHByb3BlcnRpZXNcbiAgICAgICAgT2JqZWN0LmtleXMoY2xhc3NEZWZpbml0aW9uKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgICAgICAgICB2YXIgcHJvcGVydHkgPSBjbGFzc0RlZmluaXRpb25ba2V5XTtcblxuICAgICAgICAgICAgLy8gaW5oZXJpdHMgZnJvbSBhbm90aGVyIGNsYXNzIC8gcHJvdG90eXBlXG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnaW5oZXJpdHMnKSByZXR1cm47XG5cbiAgICAgICAgICAgIC8vIG1hcCBhcyBtZXRob2RcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBwcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHByb3BlcnRpZXNba2V5XSA9IHt2YWx1ZTogcHJvcGVydHksIGVudW1lcmFibGU6IGtleVswXSAhPT0gJ18nfTtcblxuICAgICAgICAgICAgICAgIC8vIHRoaXMgbWF5IGJlIHVzZWQgdG8gYnVpbGQgbW9yZSBtZWFuaW5nZnVsIHN0YWNrIHRyYWNlc1xuICAgICAgICAgICAgICAgIGlmICghcHJvcGVydGllc1trZXldLnZhbHVlLmRpc3BsYXlOYW1lKSAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHByb3BlcnRpZXNba2V5XS52YWx1ZSwgJ2Rpc3BsYXlOYW1lJywge3ZhbHVlOiBrZXl9KTtcblxuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGlzIGFuIHN1cGVyIG1ldGhvZCB0byBjYWxsIG9uIGFueSBvZiB0aGUgcHJvdG90eXBlc1xuICAgICAgICAgICAgICAgIHNldFN1cGVyKGtleSwgcHJvcGVydHksIGNsYXNzRGVmaW5pdGlvbi5pbmhlcml0cywgY2xhc3NEZWZpbml0aW9uKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbW9yZSBhbmFseXRpY3MgcmVxdWlyZWRcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBwcm9wZXJ0eSA9PT0gJ29iamVjdCcgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHByb3BlcnR5KSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblxuICAgICAgICAgICAgICAgIC8vIHByb3BlcnR5IGRlc2NyaXB0b3JcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvcGVydHksICdnZXQnKSB8fCBPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChwcm9wZXJ0eSwgJ3ZhbHVlJykgfHwgT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocHJvcGVydHksICdzZXQnKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIU9iamVjdC5rZXlzKHByb3BlcnR5KS5zb21lKGZ1bmN0aW9uKGtleSl7IHJldHVybiBbJ2dldCcsICdzZXQnLCAndmFsdWUnLCAnZW51bWVyYWJsZScsICd3cml0YWJsZScsICdjb25maWd1cmFibGUnXS5pbmRleE9mKGtleSkgPT09IC0xO30pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGVyZSBhciBlbm8gb3RoZXIga2V5cyBvbiB0aGUgb2JlamN0LCB3ZSBzaG91bGQgZXhwZWN0IGEgZGVmaW5pdGlvbiBoZXJyZVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzW2tleV0gPSBwcm9wZXJ0eTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm9wZXJ0eS52YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFN1cGVyKGtleSwgcHJvcGVydHkudmFsdWUsIGNsYXNzRGVmaW5pdGlvbi5pbmhlcml0cywgY2xhc3NEZWZpbml0aW9uKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgbWF5IGJlIHVzZWQgdG8gYnVpbGQgbW9yZSBtZWFuaW5nZnVsIHN0YWNrIHRyYWNlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcHJvcGVydHkudmFsdWUuZGlzcGxheU5hbWUpIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm9wZXJ0eS52YWx1ZSwgJ2Rpc3BsYXlOYW1lJywge3ZhbHVlOiBrZXl9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXNba2V5XSA9IHByb3BlcnRpZXNba2V5XSA9IHt2YWx1ZTogcHJvcGVydHksIGVudW1lcmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllc1trZXldID0gcHJvcGVydGllc1trZXldID0ge3ZhbHVlOiBwcm9wZXJ0eSwgZW51bWVyYWJsZTogdHJ1ZSwgd3JpdGFibGU6IHRydWV9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gbWFwIGFzIHNjYWxhciBwcm9wZXJ0eVxuICAgICAgICAgICAgZWxzZSBwcm9wZXJ0aWVzW2tleV0gPSB7dmFsdWU6IHByb3BlcnR5LCBlbnVtZXJhYmxlOiB0cnVlLCB3cml0YWJsZTogdHJ1ZX07XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgLy8gY2hlY2sgZm9yIGVzNiBmZWF0dXJlc1xuICAgICAgICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gY2xhc3NEZWZpbml0aW9uKSBwcm9wZXJ0aWVzW1N5bWJvbC5pdGVyYXRvcl0gPSB7dmFsdWU6IGNsYXNzRGVmaW5pdGlvbltTeW1ib2wuaXRlcmF0b3JdLCB3cml0YWJsZTogdHJ1ZX07XG5cblxuXG5cblxuICAgICAgICAvLyBjb25zdHJ1Y3RvciBmdW5jdGlvbiB0aGF0IGlzIHJldHVybmVkXG4gICAgICAgIC8vIHRvIHRoZSB1c2VyXG4gICAgICAgIGNsYXNzQ29uc3RydWN0b3IgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyICAgYXJncyA9IFtdXG4gICAgICAgICAgICAgICAgLCByZXN1bHQsIGksIGw7XG5cblxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlIG5ldyBrZXl3b3JkIHdhcyBmb3Jnb3R0ZW5cbiAgICAgICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBjbGFzc0NvbnN0cnVjdG9yKSkgdGhyb3cgbmV3IEVycm9yKCd0aGUgY2xhc3MgY29uc3RydWN0b3Igd2FzIGNhbGxlZCB3aXRob3V0IHRoZSDCq25ld8K7IGtleXdvcmQhJyk7XG5cbiAgICAgICAgICAgIC8vIGNvbnZlcnQgYXJncyBpbnRvIGFuIGFycnkgaW4gb3JkZXJcbiAgICAgICAgICAgIGZvciAoaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSBhcmdzLnB1c2goYXJndW1lbnRzW2ldKTtcblxuXG4gICAgICAgICAgICAvLyBjaGVjayBpZiB0aGUgY2xhc3MgZ290IGEgY29uc3RydWN0b3IgbWV0aG9kXG4gICAgICAgICAgICBpZiAodGhpcy5pbml0KSByZXN1bHQgPSB0aGlzLmluaXQuYXBwbHkodGhpcywgYXJncyk7XG5cbiAgICAgICAgICAgIC8vIG9yIHdlIGluaGVyaXRlZCBmcm9tIGEgY29uc3RydWN0b3JcbiAgICAgICAgICAgIGVsc2UgaWYgKHR5cGVvZiBjbGFzc0RlZmluaXRpb24uaW5oZXJpdHMgPT09ICdmdW5jdGlvbicpIGNsYXNzRGVmaW5pdGlvbi5pbmhlcml0cy5hcHBseSh0aGlzLCBhcmdzKTtcblxuXG4gICAgICAgICAgICAvLyB3ZSByZXR1cm4gYW55dGhpbmcgd2UgZ290IGZyb20gdGhlIGNvbnN0cnVjdG9yIGFzIHJlc3VsdFxuICAgICAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgIT09ICd1bmRlZmluZWQnKSByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9O1xuXG5cblxuXG4gICAgICAgIC8vIHNldCBjb25zdHJ1Y3RvciBwcm90b3R5cGVcbiAgICAgICAgY2xhc3NDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKGNsYXNzRGVmaW5pdGlvbi5pbmhlcml0cyA/IChjbGFzc0RlZmluaXRpb24uaW5oZXJpdHMucHJvdG90eXBlID8gY2xhc3NEZWZpbml0aW9uLmluaGVyaXRzLnByb3RvdHlwZSA6IGNsYXNzRGVmaW5pdGlvbi5pbmhlcml0cykgOiB7fSwgcHJvcGVydGllcyk7XG5cbiAgICAgICAgLy8gaWRlbnRpZnkgYXMgZWUgY2xhc3MgdXNpbmcgdGhlIGluaXQgZnVuY3Rpb24gYXMgaXRzIGNvbnRydWN0b3JcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNsYXNzQ29uc3RydWN0b3IucHJvdG90eXBlLCAnX19faXNFZUNsYXNzJywge3ZhbHVlOnRydWV9KTtcblxuICAgICAgICByZXR1cm4gY2xhc3NDb25zdHJ1Y3RvcjtcbiAgICB9O1xuXG5cblxuXG4gICAgLy8gc2V0IGVudW1lcmFibGUgcHJvcGVydHlcbiAgICBDbGFzcy5FbnVtZXJhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnZW51bWVyYWJsZScsIHt2YWx1ZTogdHJ1ZSwgZW51bWVyYWJsZTogdHJ1ZX0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLy8gc2V0IGNvbmZpZ3VyYWJsZSBwcm9wZXJ0eVxuICAgIENsYXNzLkNvbmZpZ3VyYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NvbmZpZ3VyYWJsZScsIHt2YWx1ZTogdHJ1ZSwgZW51bWVyYWJsZTogdHJ1ZX0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLy8gc2V0IHdyaXRhYmxlIHByb3BlcnR5XG4gICAgQ2xhc3MuV3JpdGFibGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd3cml0YWJsZScsIHt2YWx1ZTogdHJ1ZSwgZW51bWVyYWJsZTogdHJ1ZX0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgLy8gcmV0dXJuIHRoZSBjbGFzcyBwcm90b3R5cGVcbiAgICBDbGFzcy5wcm90byA9IGZ1bmN0aW9uKGluc3RhbmNlKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgaW5zdGFuY2UgPT09ICdvYmplY3QnID8gT2JqZWN0LmdldFByb3RvdHlwZU9mKGluc3RhbmNlKSA6IHVuZGVmaW5lZDtcbiAgICB9O1xuXG4gICAgLy8gcmV0dXJuIGFsbCBlbnVtZXJhYmxlIGtleSBvZiB0aGUgY2xhc3MgYW4gaXRzIHByb3RvdHlwZXNcbiAgICBDbGFzcy5rZXlzID0gZnVuY3Rpb24oaW5zdGFuY2UpIHtcbiAgICAgICAgdmFyIGtleXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIGluc3RhbmNlKSBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgfTtcblxuICAgIC8vIGRlZmluZSBhIHByb2VwcnR5IG9uIGFuIG9iamV0Y1xuICAgIENsYXNzLmRlZmluZSA9IGZ1bmN0aW9uKGluc3RhbmNlLCBwcm9wZXJ0eSwgZGVzY3JpcHRvcil7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpbnN0YW5jZSwgcHJvcGVydHksIGRlc2NyaXB0b3IpO1xuICAgIH07XG5cbiAgICAvLyBpbXBsZW1lbnQgYSBjbGFzcyBvbiBhbiBvYmplY3RcbiAgICBDbGFzcy5pbXBsZW1lbnQgPSBmdW5jdGlvbihzb3VyY2UsIHRhcmdldCkge1xuICAgICAgICBDbGFzcy5rZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9O1xuXG4gICAgLy8gbGlzdCBhbGwgbWV0aG9kcyBvZiBhIGNsYXNzXG4gICAgQ2xhc3MuaW5zcGVjdCA9IGZ1bmN0aW9uKG9iaiwgZGVzY3JpcHRpb24pIHtcbiAgICAgICAgZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbiB8fCB7fTtcblxuICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLnNvcnQoKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqW25hbWVdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb25bbmFtZV0gPSBmdW5jdGlvbigpe307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChuYW1lICE9PSAnX19faXNFZUNsYXNzJykge1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uW25hbWVdID0gb2JqW25hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaikpIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLnN1cGVyID0ge307XG4gICAgICAgICAgICBDbGFzcy5pbnNwZWN0KE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopLCBkZXNjcmlwdGlvbi5zdXBlcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVzY3JpcHRpb247XG4gICAgfTtcblxuXG4gICAgcmV0dXJuIENsYXNzO1xufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
