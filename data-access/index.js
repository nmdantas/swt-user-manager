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

var Sequelize = require('sequelize');

var defaultDatabase = new Sequelize('swtdb_dev', process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    pool: {
        min: 0,
        max: process.env.DB_POOL_LIMIT
    }
});

var userDatabase = new Sequelize(process.env.DB_BASE, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    pool: {
        min: 0,
        max: process.env.DB_POOL_LIMIT
    }
});

// Models
var ApplicationSchema = defaultDatabase.import('./models/application');
var UserSchema = userDatabase.import('./models/user');
var UserSessionSchema = userDatabase.import('./models/userSession');
var ViewUserAccess = userDatabase.import('./models/viewUserAccess');

module.exports = {    
    user: userService(connectionPool),
    User: UserSchema,
    Session: UserSessionSchema,
    Application: ApplicationSchema,
    databases: {
        user: userDatabase,
        default: defaultDatabase        
    },
    views: {
        userAccess: ViewUserAccess
    }
};