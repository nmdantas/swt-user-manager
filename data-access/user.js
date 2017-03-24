/*
 * data-access
 * 
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-03-19 | Nicholas M. Dantas
 */

'use strict';

var connectionPool = null;

exports = module.exports = initialize;

/**
 * Expose 'initialize()'.
 */
function initialize(pool) {
    if (connectionPool == null)
        connectionPool = pool;

    return {
        get: get,        
        getAddress: getAddress,
        getDetails: getDetails,
        checkPassword: checkPassword,
        session: {
            exists: checkSession, 
            create: createSession,
            delete: deleteSession
        }
    };
}

/**
 * Select all product imports
 *
 * @return {UserEntity[]}
 * @public
 */
function get(userInfo, successCallback, errorCallback) {
    // Obtem uma conexao do pool
    connectionPool.getConnection(function(poolError, connection) {
        if (poolError) {
            errorCallback(poolError);

            return;
        }

        var query = 'SELECT	APP_TOKEN ' +
                    '       USER_ID, ' +
                    '       USER_EMAIL, ' +
                    '       USER_ROLE, ' +
                    '       USER_NAME, ' +
                    '       USER_LASTNAME, ' +
                    '       USER_NICKNAME, ' +
                    '       USER_BIRTHDAY, ' +
                    '       USER_DOCUMENT, ' +
                    '       ADDRESS_ZIPCODE, ' +
                    '       ADDRESS_ADDRESS, ' +
                    '       ADDRESS_DISTRICT, ' +
                    '       ADDRESS_CITY, ' +
                    '       ADDRESS_STATE, ' +
                    '       ADDRESS_LATITUDE, ' +
                    '       ADDRESS_LONGITUDE, ' +
                    '       ADDRESS_NUMBER, ' +
                    '       ADDRESS_COMPLEMENT, ' +
                    '       MENU_ID, ' +
                    '       MENU_PATH, ' +
                    '       MENU_NAME, ' +
                    '       MENU_DESCRIPTION, ' +
                    '       MENU_PARENT_ID, ' +
                    '       MENU_DISPLAY_ORDER, ' +
                    '       MENU_ICON ' +
                    'FROM swtuserdb_dev.VIEW_USER_ACCESS ' +
                    'WHERE USER_ID = ? ' +
                        'AND APP_TOKEN = ?'

        connection.query(query, [userInfo.id, userInfo.applicationToken], function (error, results, fields) {
            connection.release();

            if (error) {
                errorCallback(error);
            } else {
                successCallback(results);
            }
        });
    });
}

function getAddress(userId, callback) {
    // Obtem uma conexao do pool
    connectionPool.getConnection(function(poolError, connection) {
        if (poolError) {
            next(poolError);

            return;
        }
        
        var query = 'SELECT	ZIPCODE, ' +
                    '       ADDRESS, ' +
                    '       DISTRICT, ' +
                    '       CITY, ' +
                    '       STATE, ' +
                    '       COUNTRY, ' +
                    '       STATUS, ' +
                    '       LATITUDE, ' +
                    '       LONGITUDE, ' +
                    '       NUMBER, ' +
                    '       COMPLEMENT ' +
                    'FROM swtuserdb_dev.USER_ADDRESS ' +
                    'WHERE USER_ID = ? ';

        connection.query(query, [userId], function (error, results, fields) {
            connection.release();

            if (error) {
                next(error);
            } else {

                // Verifica se encontrou os dados de endereço
                if (results.length === 1) {
                    callback(results[0]);
                } else {
                    callback({});
                }
            }
        });
    });
}

function getDetails(userId, callback) {
    // Obtem uma conexao do pool
    connectionPool.getConnection(function(poolError, connection) {
        if (poolError) {
            next(poolError);

            return;
        }
        
        var query = 'SELECT	NAME, ' +
                    '       BIRTHDAY, ' +
                    '       LASTNAME, ' +
                    '       NICKNAME, ' +
                    '       DOCUMENT ' +
                    'FROM swtuserdb_dev.USER_DATA ' +
                    'WHERE USER_ID = ? ';

        connection.query(query, [userId], function (error, results, fields) {
            connection.release();

            if (error) {
                next(error);
            } else {

                // Verifica se encontrou os dados
                if (results.length === 1) {
                    callback(results[0]);
                } else {
                    callback({});
                }
            }
        });
    });
}

function checkPassword(userInfo, successCallback, errorCallback) {
    // Obtem uma conexao do pool
    connectionPool.getConnection(function(poolError, connection) {
        if (poolError) {
            errorCallback(poolError);

            return;
        }

        var query = 'SELECT	ID ' +
                    'FROM swtuserdb_dev.USER ' +
                    'WHERE EMAIL = ? ' +
                        'AND TOKEN = ?'

        connection.query(query, [userInfo.username, userInfo.password], function (error, results, fields) {
            connection.release();

            if (error) {
                errorCallback(error);
            } else {

                // Se nao houver retorno significa que o usuario ou a senha esta invalida
                if (results.length > 0) {
                    successCallback(results[0].ID);
                } else {
                    errorCallback();
                }
            }
        });
    });
}

function checkSession(userInfo, successCallback, errorCallback) {
    // Obtem uma conexao do pool
    connectionPool.getConnection(function(poolError, connection) {
        if (poolError) {
            errorCallback(poolError);

            return;
        }

        var query = 'SELECT	SESSION_KEY ' +
                    'FROM swtuserdb_dev.USER_SESSION        AS US ' +
                    '   INNER JOIN swtdb_dev.APPLICATIONS   AS APP ON APP.APP_ID = US.APP_ID ' +
                    'WHERE US.EMAIL = ? ' +
                        'AND APP.APPLICATION_TOKEN = ?'

        connection.query(query, [userInfo.username, userInfo.applicationToken], function (error, results, fields) {
            connection.release();

            if (error) {
                errorCallback(error);
            } else {

                // Se nao houver retorno significa que o usuario não tem
                // permissão para acessar a aplicação
                if (results.length > 0) {
                    successCallback(results[0].SESSION_KEY);
                } else {
                    successCallback(null);
                }
            }
        });
    });
}

function createSession(sessionInfo, successCallback, errorCallback) {
    // Obtem uma conexao do pool
    connectionPool.getConnection(function(poolError, connection) {
        if (poolError && errorCallback) {
            errorCallback(poolError);

            return;
        }

        var command = ' INSERT INTO swtuserdb_dev.USER_SESSION SET ?'; // +
                      //' (USER_ID, SESSION_KEY, EMAIL, APP_ID) ' +
                      //' VALUES ?';// +
                      //' (79, 'chave', 'n.moraes.dantas@gmail.com', 5)'
        var args = {
            USER_ID: sessionInfo.user.id,             
            EMAIL: sessionInfo.user.email, 
            SESSION_KEY: sessionInfo.accessToken, 
            APP_ID: sessionInfo.application.id
        };

        connection.query(command, args, function(error, results, fields) {
            connection.release();

            if (successCallback) {
                successCallback();
            }
        }); 
    });
}

function deleteSession(sessionInfo, successCallback, errorCallback) {
    // Obtem uma conexao do pool
    connectionPool.getConnection(function(poolError, connection) {
        if (poolError && errorCallback) {
            errorCallback(poolError);

            return;
        }

        var command = ' DELETE FROM swtuserdb_dev.USER_SESSION WHERE USER_ID = ?';

        connection.query(command, [sessionInfo.user.id], function(error, results, fields) {
            connection.release();

            if (successCallback) {
                successCallback();
            }
        }); 
    });    
}