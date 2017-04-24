/*
 * Application Schema (For Sequelize ORM)
 *
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-04-23 | Nicholas M. Dantas
 */

'use strict';

module.exports = function(sequelize, DataType) {
    return sequelize.define('Application', {
        appId: { 
            field: 'APP_ID', 
            type: DataType.BIGINT(20), 
            primaryKey: true,
            allowNull: false 
        },
        name: { 
            field: 'NAME', 
            type: DataType.STRING,
            allowNull: false,
            validate: {
                len: [0, 100]
            }
        },
        displayName: { 
            field: 'DISPLAY_NAME', 
            type: DataType.STRING,
            validate: {
                len: [0, 100]
            }
        },
        code: { 
            field: 'CODE', 
            type: DataType.STRING,
            validate: {
                len: [0, 10]
            }
        },
        status: { 
            field: 'STATUS',
            type: DataType.INTEGER(1),
            allowNull: false
        },
        applicationToken: { 
            field: 'APPLICATION_TOKEN', 
            type: DataType.STRING,
            allowNull: false,
            validate: {
                len: [0, 20]
            }
        },
        needActivation: { 
            field: 'NEED_ACTIVATION',
            type: DataType.INTEGER(1)
        }
    }, {
        timestamps: false,
        paranoid: false,
        freezeTableName: true,
        tableName: 'APPLICATIONS'
    });
}