/*
 * View User Access Schema (For Sequelize ORM)
 *
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-04-23 | Nicholas M. Dantas
 */

'use strict';

module.exports = function(sequelize, DataType) {
    return sequelize.define('ViewUserAccessMobile', {
        userId: { field: 'USER_ID', type: DataType.BIGINT },
        userEmail: { field: 'USER_EMAIL', type: DataType.STRING },
        userPhoto: { field: 'USER_PHOTO', type: DataType.STRING },
        userCreation: { field: 'USER_CREATION_DATE', type: DataType.DATE },
        userPassword: { field: 'USER_PASSWORD', type: DataType.STRING },
        userSalt: { field: 'USER_SALT', type: DataType.STRING },

        userAppStatus: { field: 'USER_APP_STATUS', type: DataType.INTEGER },

        appId: { field: 'APP_ID', type: DataType.BIGINT },
        appToken: { field: 'APP_TOKEN', type: DataType.STRING },
        appName: { field: 'APP_NAME', type: DataType.STRING }
    }, {
        timestamps: false,
        paranoid: false,
        freezeTableName: true
    });
}