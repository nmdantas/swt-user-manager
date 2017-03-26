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
router.get('/', framework.security.authorize('Admin'), business.list);
// Cria um novo usuario
router.post('/', framework.security.authorize('Admin'), business.create);
// Atualiza todos os usuarios
router.put('/', framework.security.authorize('Admin'), business.update);
// Apaga/Desativa todos os usuarios
router.delete('/', framework.security.authorize('Admin'), business.delete);

// Obtem o usuario especifico
router.get('/:id', business.list);
// Atualiza o usuario especifico
router.put('/:id', business.update); 
// Apaga/Desativa o usuario especifico
router.delete(':/id', business.delete);

// Atualiza a senha
router.put('/:id/password', business.password.update);
// Reinicia senha
router.patch('/:id/password', business.password.reset);

module.exports = router;