/*
 * User controller
 * 
 * Copyright(c) 2017 Fabbrika
 * Author: 2017-03-19 | Nicholas M. Dantas
 */

'use strict';

var router  = require('express').Router();
var business= require('./../business/user');

router.post('/login', business.login);

router.post('/logout', business.logout);

module.exports = router;