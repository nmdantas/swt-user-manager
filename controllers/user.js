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
router.post('/login', business.login);
// Logout
router.post('/logout', business.logout);

// Obtem todos usuarios
router.get('/', framework.middlewares.authorize('Admin'));
// Cria um novo usuario
router.post('/', framework.middlewares.authorize('Admin'));
// Atualiza todos os usuarios
router.put('/', framework.middlewares.authorize('Admin'));
// Apaga/Desativa todos os usuarios
router.delete('/', framework.middlewares.authorize('Admin'));

// Obtem o usuario especifico
router.get('/:id');
// Atualiza o usuario especifico
router.put('/:id'); 
// Apaga/Desativa o usuario especifico
router.delete(':/id');

// Atualiza a senha
router.put('/:id/password');
// Reinicia senha
router.patch('/:id/password');

module.exports = router;