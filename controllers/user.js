/*
 * User controller
 * 
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-03-19 | Nicholas M. Dantas
 */

'use strict';

var router      = require('express').Router();
var business    = require('./../business/user');
var framework   = require('swt-framework');

// Login
router.post('/users/login', business.login);
router.post('/users/login/mobile', business.mobile.login);
// Logout
router.post('/users/logout', business.logout);
router.post('/users/logout/mobile', business.logout);
// Refresh session
router.post('/users/refresh', business.refresh);

// Obtem todos usuarios
router.get('/users', business.list);
// Cria um novo usuario
router.post('/users', framework.security.authorize('Admin'), business.create);
router.post('/users/mobile', business.mobile.create);

// Obtem o usuario especifico
router.get('/users/:id', business.list);
router.get('/users/:id/applications/:token?', business.list);
// Atualiza o usuario especifico
router.put('/users/:id', business.update);
router.put('/users/:id/mobile', business.mobile.update);
// Apaga/Desativa o usuario especifico
router.delete('/users/:id', business.delete);

// Atualiza a senha
router.put('/users/:id/password', business.password.update);
// Reinicia senha
router.patch('/users/:id/password', business.password.reset);

module.exports = router;