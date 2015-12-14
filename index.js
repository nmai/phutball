// Server

'use strict'

var express = require('express')
var app = express()

// Host any 3rd party libraries that weren't bundled
app.use(express.static('./lib'))

// Host the bundle.js file (concatenated client code)
app.use(express.static('./build'))

// Host static assets (e.g. index.html, logo.png)
app.use(express.static('./static'))

app.listen(8080)

console.log('Server started OK')
