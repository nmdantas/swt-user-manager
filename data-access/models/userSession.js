/*
 * User Session Schema (For Sequelize ORM)
 *
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-04-23 | Nicholas M. Dantas
 */

'use strict';

module.exports = function(sequelize, DataType) {
    return sequelize.define('UserSession', {
        userId: { 
            field: 'USER_ID', 
            type: DataType.BIGINT(20), 
            primaryKey: true,
            allowNull: false
        },        
        appId: { 
            field: 'APP_ID', 
            type: DataType.BIGINT(20), 
            primaryKey: true,
            allowNull: false
        },
        sessionKey: { 
            field: 'SESSION_KEY', 
            type: DataType.STRING,
            allowNull: false,
            validate: {
                len: [0, 100]
            }
        },
        email: { 
            field: 'EMAIL', 
            type: DataType.STRING,
            validate: {
                len: [0, 100]
            }
        }
    }, {
        timestamps: false,
        paranoid: false,
        freezeTableName: true,
        tableName: 'USER_SESSION'
    });
}