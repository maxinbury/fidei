const express = require ('express')
const router = express.Router()
const pool = require('../database')
const {isLoggedIn} = require('../lib/auth') //proteger profile


