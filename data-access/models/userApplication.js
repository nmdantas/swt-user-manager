/*
 * User Schema (For Sequelize ORM)
 *
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-04-23 | Nicholas M. Dantas
 */

'use strict';

module.exports = function(sequelize, DataType) {
    return sequelize.define('UserApplication', {
        userId: { 
            field: 'USER_ID', 
            type: DataType.BIGINT(20), 
            primaryKey: true, 
            autoIncrement: false,
            allowNull: false
        },
        appId: { 
            field: 'APP_ID', 
            type: DataType.BIGINT(20), 
            primaryKey: true, 
            autoIncrement: false,
            allowNull: false
        },
        status: { 
            field: 'STATUS', 
            type: DataType.INTEGER(1),
            allowNull: false
        },
        lastAccess: { 
            field: 'LAST_ACCESS', 
            type: DataType.DATE,
            allowNull: true
        },
        notificationToken: { 
            field: 'NOTIFICATION_TOKEN', 
            type: DataType.STRING,
            allowNull: true,
            validate: {
                len: [0, 500]
            } 
        },
    }, {
        timestamps: false,
        paranoid: false,
        freezeTableName: true,
        tableName: 'USER_APPLICATIONS'
    });
}