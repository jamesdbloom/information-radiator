/*
 * information-radiator
 * https://github.com/jamesdbloom/information-radiator
 *
 * Copyright (c) 2014 James D Bloom
 * Licensed under the MIT license.
 */

'use strict';

var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "css": "text/css",
    "ttf": "application/x-font-ttf",
    "otf": "application/x-font-opentype",
    "woff": "application/font-woff"
};

exports.run = configuration => {
    var http = require('http');
    var url = require('url');
    var path = require('path');
    var fs = require('fs');
    var nconf = require('nconf');

    require('jquery');

    // Setup configuration to use (in-order):
    //   1. Command-line arguments
    //   2. Environment variables
    //   3. A file located at './config.json'
    //   4. Parameter value
    //   5. Default value
    nconf
        .argv()
        .env()
        .file({ file: './config.json' })
        .overrides(configuration)
        .defaults({
            port: 8080,
            pollPeriod: 10,
            refresh: false,
            groups: []
        });

    function handlePostRequest(callback) {
        return request => {
            var queryData = "";

            request.on('data', data => {
                queryData += data;
                if (queryData.length > 1e6) {
                    queryData = "";
                }
            });

            request.on('end', () => {
                var parsedQueryData;

                //duck-typing
                try {
                    parsedQueryData = JSON.parse(queryData);
                } catch (e) {
                    parsedQueryData = queryData;
                }

                callback(parsedQueryData, request);
            });
        };
    }

    function readValue(json, path, expression) {
        if (path) {
            return readPath(json, path.split('.'));
        } else if (expression) {
            return readExpression(json, expression);
        }
    }

    function readPath(json, path) {
        if (path && json) {
            if (path.length === 1) {
                return json[path[0]] || '';
            } else {
                return readPath(json[path[0]], path.splice(1));
            }
        } else {
            return '';
        }
    }

    function readExpression(json, expression) {
        if (readExpression && json) {
            var subPath = /\$\{[a-zA-Z0-9\-\_\.]*\}/.exec(expression);
            if (subPath) {
                var newExpression = expression.replace(subPath, readPath(json, (/[a-zA-Z0-9\-\_\.]+/.exec(subPath)[0]).split('.')));
                return readExpression(json, newExpression);
            } else {
                return (expression || '').trim();
            }
        } else {
            return '';
        }
    }

    var module_directory = module.filename.replace("information-radiator.js", "");

    var routing = (req, res) => {
        var uri = url.parse(req.url).pathname;
        var filename = url.parse(req.url).path;

        try {
            if (uri === '/' && req.method === 'GET') {
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                fs.createReadStream(module_directory + 'view/index.html').pipe(res);
            } else if (uri === '/lib/jquery.js' && req.method === 'GET') {
                res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
                fs.createReadStream(module_directory + '../node_modules/jquery/dist/jquery.js').pipe(res);
            } else if (uri === '/lib/underscore.js' && req.method === 'GET') {
                res.writeHead(200, {'Content-Type': 'text/javascript; charset=utf-8'});
                fs.createReadStream(module_directory + '../node_modules/underscore/underscore.js').pipe(res);
            } else if (uri.indexOf('view') !== -1 && req.method === 'GET') {
                res.writeHead(200, {'Content-Type': mimeTypes[path.extname(filename).split(".")[1]], 'Cache-Control': 'no-cache, no-store'});
                if(fs.existsSync(module_directory + filename) && fs.lstatSync(module_directory + filename).isFile()) {
                    fs.createReadStream(module_directory + filename).pipe(res);
                } else {
                    res.end();
                }
            } else if (uri === '/pipelines.json' && req.method === 'GET') {
                res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache, no-store'});
                res.write(JSON.stringify(nconf.get(), null, 2));
                res.end();
            } else if (uri === '/data.json' && req.method === 'POST') {

                /*jshint eqeqeq:false */
                handlePostRequest(requestBody => {
                    var options = {
                        host: url.parse(requestBody.url).hostname,
                        port: url.parse(requestBody.url).port,
                        path: url.parse(requestBody.url).path
                    };
                    http.request(options, handlePostRequest((responseBody, request) => {
                        res.writeHead(request.statusCode, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache, no-store'});
                        res.write(JSON.stringify({
                            value: readValue(responseBody, requestBody.path, requestBody.expression),
                            match: (requestBody.condition ? readValue(responseBody, requestBody.condition.path, requestBody.condition.expression) == requestBody.condition.value : true)
                        }));
                        res.end();
                    })).on('error', e => {
                        console.log('problem making request to ' + requestBody.url + ' => ' + e.message);
                    }).end();
                })(req);
            }
        } catch (e) {
            console.log("error: " + e);
        }
    };

    http.createServer(routing).listen(nconf.get('port'));

    if (nconf.get('verbose')) {
        console.log('information-radiator starting on port: ' + nconf.get('port') + ' configuration is...\n\n' + JSON.stringify(nconf.get(), null, 2));
    }
};
