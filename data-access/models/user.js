/*
 * User Schema (For Sequelize ORM)
 *
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-04-23 | Nicholas M. Dantas
 */

'use strict';

module.exports = function(sequelize, DataType) {
    return sequelize.define('User', {
        id: { 
            field: 'ID', 
            type: DataType.BIGINT(20), 
            primaryKey: true, 
            autoIncrement: true, 
            allowNull: false
        },
        email: { 
            field: 'EMAIL', 
            type: DataType.STRING,
            allowNull: false,
            validate: {
                len: [0, 150]
            }
        },
        typeLogin: { 
            field: 'TYPE_LOGIN', 
            type: DataType.INTEGER(11),
            allowNull: false
        },
        salt: { 
            field: 'SALT', 
            type: DataType.STRING,
            validate: {
                len: [0, 255]
            } 
        },
        token: { 
            field: 'TOKEN', 
            type: DataType.STRING, 
            allowNull: false,
            validate: {
                len: [0, 500]
            }
        },
        userPhoto: { 
            field: 'USER_PHOTO', 
            type: DataType.STRING,
            validate: {
                len: [0, 255]
            } 
        },
        creationDate: { 
            field: 'CREATION_DATE', 
            type: DataType.DATE,
            allowNull: false
        }
    }, {
        timestamps: false,
        paranoid: false,
        freezeTableName: true,
        tableName: 'USER'
    });
}