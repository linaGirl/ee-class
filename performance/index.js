(function() {
    'use strict';

    let EE = require('./ee');
    let ES6 = require('./es6');
    let log = require('ee-log');


    let iterations = 100;
    let start;
    let ee = 0;
    let es6 = 0;



    for (let k = 0; k < 1000; k++) {
        start = process.hrtime();
        for (let i = 0; i < iterations; i++) {
            new ES6({
                  name: "fabian"
                , age: 15
                , isAlive: true
            }).describe();
        }
        es6 += process.hrtime(start)[1];
        log.success('ES6: '+(process.hrtime(start)[1]));


        start = process.hrtime();
        for (let i = 0; i < iterations; i++) {
            new EE({
                  name: "fabian"
                , age: 15
                , isAlive: true
            }).describe();
        }
        ee += process.hrtime(start)[1];
        log.success('EE: '+(process.hrtime(start)[1]));



        
    }


    log.warn('EE: '+(ee/1000/1000));
    log.warn('ES6: '+(es6/1000/1000));
})();