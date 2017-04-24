/*
 * View User Access Schema (For Sequelize ORM)
 *
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-04-23 | Nicholas M. Dantas
 */

'use strict';

module.exports = function(sequelize, DataType) {
    return sequelize.define('ViewUserAccess', {
        appId: { field: 'APP_ID', type: DataType.BIGINT },
        appToken: { field: 'APP_TOKEN', type: DataType.STRING },
        appName: { field: 'APP_NAME', type: DataType.STRING },

        userId: { field: 'USER_ID', type: DataType.BIGINT },
        userEmail: { field: 'USER_EMAIL', type: DataType.STRING },
        userPassword: { field: 'USER_PASSWORD', type: DataType.STRING },
        userPhoto: { field: 'USER_PHOTO', type: DataType.STRING },
        userCreation: { field: 'USER_CREATION', type: DataType.DATE },
        userRole: { field: 'USER_ROLE', type: DataType.STRING },
        userName: { field: 'USER_NAME', type: DataType.STRING },
        userLastname: { field: 'USER_LASTNAME', type: DataType.STRING },
        userNickname: { field: 'USER_NICKNAME', type: DataType.STRING },
        userBirthday: { field: 'USER_BIRTHDAY', type: DataType.DATE },
        userDocument: { field: 'USER_DOCUMENT', type: DataType.STRING },

        addressZipcode: { field: 'ADDRESS_ZIPCODE', type: DataType.STRING },
        addressAddress: { field: 'ADDRESS_ADDRESS', type: DataType.STRING },
        addressDistrict: { field: 'ADDRESS_DISTRICT', type: DataType.STRING },
        addressCity: { field: 'ADDRESS_CITY', type: DataType.STRING },
        addressState: { field: 'ADDRESS_STATE', type: DataType.STRING },
        addressCountry: { field: 'ADDRESS_COUNTRY', type: DataType.STRING },
        addressLatitude: { field: 'ADDRESS_LATITUDE', type: DataType.DOUBLE },
        addressLongitude: { field: 'ADDRESS_LONGITUDE', type: DataType.DOUBLE },
        addressNumber: { field: 'ADDRESS_NUMBER', type: DataType.INTEGER },
        addressComplement: { field: 'ADDRESS_COMPLEMENT', type: DataType.STRING },

        menuId: { field: 'MENU_ID', type: DataType.BIGINT },
        menuPath: { field: 'MENU_PATH', type: DataType.STRING },
        menuName: { field: 'MENU_NAME', type: DataType.STRING },
        menuDescription: { field: 'MENU_DESCRIPTION', type: DataType.STRING },
        menuParentId: { field: 'MENU_PARENT_ID', type: DataType.BIGINT },
        menuDisplayOrder: { field: 'MENU_DISPLAY_ORDER', type: DataType.BIGINT },
        menuIcon: { field: 'MENU_ICON', type: DataType.STRING }
    }, {
        timestamps: false,
        paranoid: false,
        freezeTableName: true
    });
}