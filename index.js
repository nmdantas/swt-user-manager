/*
 * User manager framework for all SWT applications
 * 
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-03-19 | Nicholas M. Dantas
 */

'use strict';

var userRouter  = require('./controllers/user');

module.exports = {
    controllers: {
        user: userRouter
    }
};