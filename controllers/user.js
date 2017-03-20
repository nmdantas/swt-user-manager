/*
 * User controller
 * 
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-03-19 | Nicholas M. Dantas
 */

'use strict';

var TIMEOUT = process.env.CACHE_MAX_AGE; /* Tempo Default no Cache Atual - 10 minutos */

var router      = require('express').Router();
var framework   = require('swt-framework');
var dataAccess  = require('./../data-access');
var logManager  = framework.logger;

router.post('/login', preValidation, checkPassword, checkSession, getUserAccess, formatResponse, createAccessToken);

router.post('/logout', logout);

function preValidation(req, res, next) {
    if (!req.body.username || !req.body.password) {
        var error = new Error();
        error.code = 'US004';

        next(error);
    } else {
        next();
    }
}

function checkPassword(req, res, next) {
    var successCallback = function(result) {
        req.data = result;
        
        next();
    }

    var errorCallback = function (error) {        
        error = error || new Error();
        error.code = 'US001';

        logManager.error(error, 'swtUserManager.userController.login');
                
        next(error);
    }

    var userInfo = {
        username: req.body.username,
        password: req.body.password
    }

    dataAccess.user.checkPassword(userInfo, successCallback, errorCallback);
}

function checkSession(req, res, next) {
    var successCallback = function(result) {
        req.accessToken = result;

        next();
    }

    var errorCallback = function (error) {
        logManager.error(error, 'swtUserManager.userController.login');
        
        next(error);
    }

    var userInfo = {
        username: req.body.username,
        applicationId: req.body.applicationId
    }

    dataAccess.user.session.exists(userInfo, successCallback, errorCallback);
}

function getUserAccess(req, res, next) {
    // Caso possua esta propriedade na requisicao significa que ja existe sessao    
    if (req.accessToken && global.CacheManager.has(req.accessToken)) {
        var sessionInfo = global.CacheManager.get(req.accessToken);
        sessionInfo.update = true;

        // Atualiza o Cache
        global.CacheManager.set(req.accessToken, sessionInfo, req.body.keepAlive ? Infinity : TIMEOUT);

        res.json(sessionInfo);
    } else {
        var successCallback = function(results) {
            // Se nao houver retorno significa que o usuario não tem
            // permissão para acessar a aplicação
            if (results.length === 0) {                
                var error = new Error();
                error.code = 'US009';

                next(error);                
            } else {
                req.data = results;
                next();
            }
        }

        var errorCallback = function (error) {
            logManager.error(error, 'swtUserManager.userController.login');
            next(error);
        }

        var userInfo = {
            id: req.data,
            applicationId: req.body.applicationId
        }
        
        // Este metodo do data-access deve chamar o next
        dataAccess.user.get(userInfo, successCallback, errorCallback);
    }
}

function formatResponse(req, res, next) {
    var results = req.data;
    var formattedResponse = {
        user: {
            details: {},
            address: {}
        },
        roles: [],
        access: [],
        application: {
            id: req.body.applicationId
        }
    };

    // Se chegou ate esse ponto, ao menos uma linha existe nos resultados
    // Caso contrario seria resultado 403
    formattedResponse.user.id = results[0].USER_ID;
    formattedResponse.user.email = results[0].USER_EMAIL;
    
    formattedResponse.user.details.name = results[0].USER_NAME;
    formattedResponse.user.details.lastname = results[0].USER_LASTNAME;
    formattedResponse.user.details.nickname = results[0].USER_NICKNAME;
    formattedResponse.user.details.birthday = results[0].USER_BIRTHDAY;
    formattedResponse.user.details.document = results[0].USER_DOCUMENT;

    formattedResponse.user.address.zipCode = results[0].ADDRESS_ZIPCODE;
    formattedResponse.user.address.address = results[0].ADDRESS_ADDRESS;
    formattedResponse.user.address.district = results[0].ADDRESS_DISTRICT;
    formattedResponse.user.address.city = results[0].ADDRESS_CITY;
    formattedResponse.user.address.state = results[0].ADDRESS_STATE;
    formattedResponse.user.address.latitude = results[0].ADDRESS_LATITUDE;
    formattedResponse.user.address.longitude = results[0].ADDRESS_LONGITUDE;
    formattedResponse.user.address.number = results[0].ADDRESS_NUMBER;
    formattedResponse.user.address.complement = results[0].ADDRESS_COMPLEMENT;

    for (var i = 0; i < results.length; i++) {
        // Roles de Acesso
        if (formattedResponse.roles.indexOf(results[i].USER_ROLE) === -1) {
            formattedResponse.roles.push(results[i].USER_ROLE);
        }

        // Menus de Acesso
        // Apenas adiciona os menus que não possuem sub-menus
        // Os sub-menus serao adicionados na expressao 'where' na property 'children'
        if (results[i].MENU_PARENT_ID === null && !formattedResponse.access.any({ id: results[i].MENU_ID })) {
            var subMenus = results.where({ MENU_PARENT_ID: results[i].MENU_ID }).select({
                "id" : "MENU_ID",
                "path" : "MENU_PATH",
                "name" : "MENU_NAME",
                "description" : "MENU_DESCRIPTION",
                "parentId" : "MENU_PARENT_ID",
                "displayOrder" : "MENU_DISPLAY_ORDER",
                "icon" : "MENU_ICON",
                "children" : []
            });
            
            formattedResponse.access.push({
                id: results[i].MENU_ID,
                path: results[i].MENU_PATH,
                name: results[i].MENU_NAME,
                description: results[i].MENU_DESCRIPTION,
                parentId: results[i].MENU_PARENT_ID,
                displayOrder: results[i].MENU_DISPLAY_ORDER,
                icon: results[i].MENU_ICON,
                children: subMenus
            });
        }
    }

    req.data = formattedResponse;

    next();
}

function createAccessToken(req, res, next) {
    var accessToken = framework.security.signature(req.body.username);
    req.data.accessToken = accessToken;

    global.CacheManager.set(accessToken, req.data, req.body.keepAlive ? Infinity : TIMEOUT);

    dataAccess.user.session.delete(req.data);
    dataAccess.user.session.create(req.data);

    res.json(req.data);

    next();
}

function logout(req, res, next) {
    var authorization = req.headers.authorization || '';

    var innerNextFunction = function(message) {
        res.json({
            message: message
        });

        next();
    };

    // Verifica se há o token no header
    if (authorization.startsWith('Basic')) {
        var accessToken = authorization.replace(/Basic\s*/ig, '');

        if (global.CacheManager.has(accessToken)) {
            var userData = global.CacheManager.get(accessToken);
            
            var successCallback = function() {
                global.CacheManager.del(accessToken);

                innerNextFunction('Farwell');
            };

            var errorCallback = function() {
                innerNextFunction('Error deleting session');
            };

            dataAccess.user.session.delete(userData, successCallback, errorCallback);
        } else {
            innerNextFunction('Token not found');
        }       
    } else {
        innerNextFunction('Invalid Header');
    }
}

module.exports = router;