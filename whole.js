#!/usr/bin/env node

'use strict';
/**
 * Created by w1003 on 2016/11/30.
 */

exports = module.exports = require('./app/whole');

/*
 Export the version
 */

exports.version = require('./package.json').version;