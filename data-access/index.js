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

const CONNECTION_CONFIG = {
    connectionLimit : process.env.DB_POOL_LIMIT,
    host            : process.env.DB_HOST,
    user            : process.env.DB_USER,
    password        : process.env.DB_PASS,
    database        : process.env.DB_BASE
}; 

var connectionPool = database.createPool(CONNECTION_CONFIG);

module.exports = {
    user: userService(connectionPool)
};