/*
 * User manager framework for all SWT applications
 * 
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-03-19 | Nicholas M. Dantas
 */

'use strict';

module.exports = init;

/**
 * Expose 'init(config: object): any'.
 */
function init(config) {
    var framework   = require('swt-framework')(config);
    var userRouter  = require('./controllers/user');

    return {
        middlewares: {
            enablePreflight: enablePreflight,
            checkAuthorization: checkAuthorization
        },
        controllers: {
            user: userRouter
        }
    };
}

function enablePreflight(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Origin, Content-Type, Accept, X-Requested-With, Accept-Encoding');

    next();
}

function checkAuthorization(req, res, next) {

    next();
}