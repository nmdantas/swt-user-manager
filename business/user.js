/*
 * User business layer
 * 
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-03-20 | Nicholas M. Dantas
 */

'use strict';

var TIMEOUT = process.env.CACHE_MAX_AGE; /* Tempo Default no Cache Atual - 10 minutos */

var accessLayer  = require('./../data-access');
var framework   = require('swt-framework');
var logManager  = framework.logger;

module.exports = {
    login: [
        preValidation,
        checkPassword, 
        checkSession, 
        getUserAccess, 
        formatResponse, 
        createAccessToken
    ],
    logout: [
        logout
    ],
    refresh: [
        refreshSession
    ],
    list: [
        list
    ],
    create:[
        insertOrUpdate
    ],
    update: [
        insertOrUpdate
    ],
    delete: [

    ],
    password: {
        update: [

        ],
        reset: [
            
        ]
    },
    mobile: {
        login: [
            preValidation,
            checkPassword,
            checkSession, 
            getMobileUserAccess,
            formatMobileResponse,
            createAccessToken
        ],
        create:[
            insertUpdateMobilePreValidation,
            insertOrUpdate
        ],
        update: [
            insertUpdateMobilePreValidation,
            insertOrUpdate
        ],
    }
};

function formatUserData(result) {
    var formattedResponse = {
        user: {
            id: 0,
            email: null,
            photo: null,
            creation: null,
            details: {},
            address: {}
        }
    };

    formattedResponse.user.id = result.userId || result.USER_ID;
    formattedResponse.user.email = result.userEmail || result.USER_EMAIL;
    formattedResponse.user.photo = result.userPhoto || result.USER_PHOTO;
    formattedResponse.user.creation = result.userCreation || result.USER_CREATION;
    
    formattedResponse.user.details.name = result.userName || result.USER_NAME;
    formattedResponse.user.details.lastname = result.userLastname || result.USER_LASTNAME;
    formattedResponse.user.details.nickname = result.userNickname || result.USER_NICKNAME;
    formattedResponse.user.details.birthday = result.userBirthday || result.USER_BIRTHDAY;
    formattedResponse.user.details.document = result.userDocument || result.USER_DOCUMENT;
    formattedResponse.user.details.photo = result.userPhoto || result.USER_PHOTO;
    formattedResponse.user.details.creation = result.userCreation || result.USER_CREATION;
    
    formattedResponse.user.address.zipCode = result.addressZipcode || result.ADDRESS_ZIPCODE;
    formattedResponse.user.address.place = result.addressAddress || result.ADDRESS_ADDRESS;
    formattedResponse.user.address.district = result.addressDistrict || result.ADDRESS_DISTRICT;
    formattedResponse.user.address.city = result.addressCity || result.ADDRESS_CITY;
    formattedResponse.user.address.state = result.addressState || result.ADDRESS_STATE;
    formattedResponse.user.address.country = result.addressCountry || result.ADDRESS_COUNTRY;    
    formattedResponse.user.address.number = result.addressNumber || result.ADDRESS_NUMBER;
    formattedResponse.user.address.complement = result.addressComplement || result.ADDRESS_COMPLEMENT;
    formattedResponse.user.address.latitude = result.addressLatitude || result.ADDRESS_LATITUDE;
    formattedResponse.user.address.longitude = result.addressLongitude || result.ADDRESS_LONGITUDE;

    return formattedResponse;
}

function getUserAccessData(req, res, next, query, model) {
    // Caso possua esta propriedade na requisicao significa que ja existe sessao    
    if (req.accessToken && global.CacheManager.has(req.accessToken)) {
        var sessionInfo = global.CacheManager.get(req.accessToken);

        // Atualiza o Cache
        global.CacheManager.set(req.accessToken, sessionInfo, req.body.keepAlive ? Infinity : TIMEOUT);

        res.json(sessionInfo);
    } else {
        var successCallback = function(results) {
            // Se nao houver retorno significa que o usuario não tem
            // permissão para acessar a aplicação
            if (results.length === 0) {
                var error = new framework.models.SwtError({code: 'US008', httpCode: 403});

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

        accessLayer.databases.user.query(query, {
            mapToModel: true,
            model: model,
            replacements: { id: req.data, token: framework.common.parseAuthHeader(req.headers.authorization).token }, 
            type: accessLayer.databases.user.QueryTypes.SELECT
        }).then(successCallback, errorCallback);
    }
}

function preValidation(req, res, next) {
    var constraints = framework.common.validation.requiredFor('username', 'password');

    var validationErrors = framework.common.validation.validate(req.body, constraints);

    if (validationErrors) {
        var error = new framework.models.SwtError({code: 'US004', httpCode: 401, details: validationErrors});

        next(error);
    } else {
        next();
    }
}

function checkPassword(req, res, next) {
    var successCallback = function(result) {
        result = result || {};
        req.data = result.id;

        var salt = result.salt;
        var hash = result.token;
        var givenPassword = null; 
        
        // Se houver um SALT significa que a senha esta criptografada
        if (salt) {
            givenPassword = framework.security.signature.password(salt, req.body.password);
        } else {
            givenPassword = req.body.password;
        }

        // Verifica se o hash é compativel
        if (givenPassword === hash) {
            next();
        } else {
            errorCallback(new framework.models.SwtError({ httpCode: 401 }));
        }
    }

    var errorCallback = function (error) {
        error = error || new Error();
        error.code = 'US001';

        logManager.error(error, 'swtUserManager.userController.login');
                
        next(error);
    }

    accessLayer.User.findOne({
        attributes: ['id', 'token', 'salt'],
        where: { email: req.body.username }
    }).then(successCallback, errorCallback);
}

function checkSession(req, res, next) {
    var successCallback = function(result) {
        if (result) {
            req.accessToken = result.sessionKey;
        }

        next();
    }

    var errorCallback = function (error) {
        logManager.error(error, 'swtUserManager.userController.login');
        
        next(error);
    }

    accessLayer.Application.findOne({
        where: { 
            applicationToken: framework.common.parseAuthHeader(req.headers.authorization).token 
        }
    }).then(function(result) {
        accessLayer.Session.findOne({
            where: { appId: result && result.appId }
        }).then(successCallback, errorCallback);
    }, errorCallback);
}

function getUserAccess(req, res, next) {
    getUserAccessData(req, res, next, 'SELECT * FROM VIEW_USER_ACCESS WHERE USER_ID = :id AND APP_TOKEN = :token', accessLayer.views.userAccess);
}

function getMobileUserAccess(req, res, next) {
    getUserAccessData(req, res, next, 'SELECT * FROM VIEW_USER_ACCESS_MOBILE WHERE USER_ID = :id AND APP_TOKEN = :token', accessLayer.views.userAccessMobile);
}

function formatResponse(req, res, next) {
    // Se chegou ate esse ponto, ao menos uma linha existe nos resultados
    // Caso contrario seria resultado 403
    var results = req.data;
    var formattedResponse = formatUserData(results[0]);
    formattedResponse.application = {
        id: results[0].appId,
        name: results[0].appName,
        token: results[0].appToken
    };
    formattedResponse.roles = [];
    formattedResponse.access = [];    

    for (var i = 0; i < results.length; i++) {
        // Roles de Acesso
        if (formattedResponse.roles.indexOf(results[i].userRole) === -1) {
            formattedResponse.roles.push(results[i].userRole);
        }

        // Menus de Acesso
        // Apenas adiciona os menus que não possuem sub-menus
        // Os sub-menus serao adicionados na expressao 'where' na property 'children'
        if (results[i].menuParentId === null && !formattedResponse.access.any({ id: results[i].menuId })) {
            var subMenus = results.where({ menuParentId: results[i].menuId }).select({
                "id" : "menuId",
                "path" : "menuPath",
                "name" : "menuName",
                "description" : "menuDescription",
                "parentId" : "menuParentId",
                "displayOrder" : "menuDisplayOrder",
                "icon" : "menuIcon",
                "children" : []
            });
            
            formattedResponse.access.push({
                id: results[i].menuId,
                path: results[i].menuPath,
                name: results[i].menuName,
                description: results[i].menuDescription,
                parentId: results[i].menuParentId,
                displayOrder: results[i].menuDisplayOrder,
                icon: results[i].menuIcon,
                children: subMenus
            });
        }
    }

    req.data = formattedResponse;

    next();
}

function formatMobileResponse(req, res, next) {
   // Se chegou ate esse ponto, ao menos uma linha existe nos resultados
    // Caso contrario seria resultado 403
    var results = req.data;
    var formattedResponse = formatUserData(results[0]);
    formattedResponse.application = {
        id: results[0].appId,
        name: results[0].appName,
        token: results[0].appToken
    };

    delete formattedResponse.user.address;

    req.data = formattedResponse;

    next();
}

function createAccessToken(req, res, next) {
    var accessToken = framework.security.signature.token(req.body.username);
    req.data.accessToken = accessToken;

    global.CacheManager.set(accessToken, req.data, req.body.keepAlive ? Infinity : TIMEOUT);

    accessLayer.Session.destroy({ 
        where: { userId: req.data.user.id } 
    }).then(function() {
        accessLayer.Session.create({
            userId: req.data.user.id,             
            appId: req.data.application.id,            
            sessionKey: req.data.accessToken,
            email: req.data.user.email
        });
    });

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

            accessLayer.Session.destroy({ 
                where: { userId: userData.user.id } 
            }).then(successCallback, errorCallback);
        } else {
            innerNextFunction('Token not found');
        }       
    } else {
        innerNextFunction('Invalid Header');
    }
}

function refreshSession(req, res, next) {
    var authHeader = framework.common.parseAuthHeader(req.headers.authorization);
    var cache = global.CacheManager.get(authHeader.token); // Metodo get atualiza o cache

    res.json(cache);
}

function list(req, res, next) {
    var auth = framework.common.parseAuthHeader(req.headers.authorization);
    var parameters = {
        user: req.params.id,        
        email: req.query.email,
        name: req.query.name,
        token: null
    };

    // Codição mandatória, para a rota que especificada, ignora o token do usuario logado e da aplicação
    if (req.route.path === '/:id/applications/:token?') {
        parameters.token = req.params.token;
    }
    // Caso a requisição tenha sido feita por um usuario logado
    // Retornara os usuários da aplicação correspondente
    else if (auth.type === 'basic') {
        if (global.CacheManager.has(auth.token)) {
            parameters.token = global.CacheManager.get(auth.token).application.token;
        } else {
            parameters.token = -1; // Anula a pesquisa
        }
    }
    // Caso a requisição apenas contenha o token da aplicação, 
    // usará este como filtro
    else if (auth.type === 'app') {
        parameters.token = auth.token;
    }

    var successCallback = function(results) {        
        // Se chegou ate esse ponto, ao menos uma linha existe nos resultados
        // Caso contrario seria resultado 403
        if (results.length === 0) {
            var error = new framework.models.SwtError({httpCode: 404, message: 'Not found', details: { message: 'User or Application not found'}});

            next(error);

            return;
        }

        var formattedResponse = {};

        // Verifica se deve apenas retornar os dados da aplicação
        if (req.route.path === '/users/:id/applications/:token?') {
            formattedResponse = [];

            for (var i = 0; i < results.length; i++) {
                // Aplicações
                // Verifica se a aplicação já está presente na lista
                if (!formattedResponse.any({ id: results[i].APP_ID})) {
                    formattedResponse.push({
                        id: results[i].APP_ID,
                        name: results[i].APP_NAME,
                        token: results[i].APP_TOKEN
                    });
                }
            }
        } 
        // Todos os usuários
        else if (req.route.path === '/users') {
            formattedResponse = [];

            // Usuários
            // Verifica se o usuário já está presente na lista
            for (var i = 0; i < results.length; i++) {
                if (!formattedResponse.any({ id: results[i].USER_ID})) {
                    var user = formatUserData(results[i]).user;
                    user.applications = results.where({ USER_ID: user.id }).select({
                        "id": "APP_ID",
                        "name": "APP_NAME",
                        "token": "APP_TOKEN"
                    });

                    formattedResponse.push(user);
                }
            }
        }
        // Apenas um usuário 
        else {
            formattedResponse = formatUserData(results[0]).user;
            formattedResponse.applications = results.select({
                "id": "APP_ID",
                "name": "APP_NAME",
                "token": "APP_TOKEN"
            });
        }
        
        res.json(formattedResponse);
        
        next();
    }

    var errorCallback = function (error) {
        logManager.error(error, 'swtUserManager.userController.list');
        
        next(error);
    }

    accessLayer.user.get(parameters, successCallback, errorCallback);
}

function insertUpdatePreValidation(req, res, next) {
    var constraints = framework.common.validation.requiredFor([
        'firstName',
        'lastName',
        'email',
        'password',
        'birthday',
        'document'
    ]);

    var validationErrors = framework.common.validation.validate(req.body, constraints);

    if (validationErrors) {
        var error = new framework.models.SwtError({code: 'US004', httpCode: 400, details: validationErrors});

        next(error);
    } else {
        next();
    }
}

function insertUpdateMobilePreValidation(req, res, next) {
    var constraints = framework.common.validation.requiredFor([
        'firstName',
        'lastName',
        'email',
        'password'
    ]);

    var validationErrors = framework.common.validation.validate(req.body, constraints);

    if (validationErrors) {
        var error = new framework.models.SwtError({code: 'US004', httpCode: 400, details: validationErrors});

        next(error);
    } else {
        next();
    }
}

function insertOrUpdate(req, res, next) {
    var successCallback = function(results) {
        res.json({
            id: results.ID || req.body.id
        });

        next();
    }

    var errorCallback = function (error) {
        logManager.error(error, 'swtUserManager.userController.insertOrUpdate');
        next(error);
    }

    // Adiciona o id que pode ter sido passado pela rota
    req.body.id = req.params.id;

    // Verifica se deve criptografar a senha
    // Apenas criptografa a senha se for um insert 
    // ou se a senha for passada para ser atualizada
    if (!req.body.id || req.body.password) {
        req.body.salt = framework.security.signature.salt();
        req.body.password = framework.security.signature.password(req.body.salt, req.body.password);
    }

    // Nos casos de INSERT já será feita a associação à aplicação
    if (!req.body.id) {
        req.body.appToken = framework.common.parseAuthHeader(req.headers.authorization).token;
    }
    
    // Este metodo do data-access deve chamar o next
    accessLayer.user.insertOrUpdate(req.body, successCallback, errorCallback);
}

function getUserApplicationData(req, res, next) {
    var successCallback = function(results) {
        // Se nao houver retorno significa que o usuario não tem
        // permissão para acessar a aplicação
        if (results.length === 0) {
            var error = new framework.models.SwtError({code: 'US008', httpCode: 403});

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

    accessLayer.databases.user.query('SELECT * FROM VIEW_USER_ACCESS_MOBILE WHERE USER_EMAIL = :email', {
        mapToModel: true,
        model: accessLayer.views.userAccessMobile,
        replacements: { email: req.data }, 
        type: accessLayer.databases.user.QueryTypes.SELECT
    }).then(successCallback, errorCallback);
}


