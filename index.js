/*
 * User manager framework for all SWT applications
 * 
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-03-19 | Nicholas M. Dantas
 */

'use strict';

// Inicia as variaveis de ambiente
if (true/*process.argv.indexOf("--standalone") > -1*/) {
    require('dotenv').config();

    // Sobe a aplicação
    standalone(process.env.PORT);
}

var userRouter  = require('./controllers/user');

module.exports = {
    controllers: {
        user: userRouter
    },
    standalone: standalone
};

function standalone(port) {
    var express     = require('express');
    var bodyParser  = require('body-parser');
    var framework   = require('swt-framework');
    var controller  = require('./controllers/user');
    
    var app = express();

    app.use(bodyParser.json());
    app.use(framework.security.enablePreflight);

    // Rotas
    app.use('/api/v0', controller);

    // Middleware de erro
    app.use(framework.logger.middleware);

    app.listen(port || 8080);
    // framework.logger.debug('Standalone Server Started', 'swt-user-manager');
    console.log('Standalone Server Started...');
}