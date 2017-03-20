/*
 * Data access (MySql)
 *
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-03-19 | Nicholas M. Dantas
 */

'use strict';

/*
 * Module dependencies.
 */
var database    = require('mysql');
var userService = require('./user');

module.exports = init;

function init(connectionConfig) {
    var connectionPool = database.createPool(connectionConfig);
    
    return {
        user: userService(connectionPool)
    };
}