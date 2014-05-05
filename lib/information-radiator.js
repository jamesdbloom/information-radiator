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

exports.run = function (configuration) {
    var http = require('http'),
        url = require('url'),
        path = require('path'),
        fs = require('fs'),
        nconf = require('nconf');

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
        .overrides({
            config: configuration
        })
        .defaults({
            config: {
                groups: []
            }
        });

    function handlePostRequest(callback) {
        return function (request) {
            var queryData = "";

            request.on('data', function (data) {
                queryData += data;
                if (queryData.length > 1e6) {
                    queryData = "";
                }
            });

            request.on('end', function () {
                var parsedQueryData;

                //duck-typing
                try {
                    parsedQueryData = JSON.parse(queryData);
                } catch (e) {
                    parsedQueryData = queryData;
                }

                console.log("receiving response: " + queryData);
                callback(parsedQueryData, request);
            });
        };
    }

    function readValue(json, path, expression) {
        console.log("readValue - json: " + JSON.stringify(json, null, 2) + (path ? " path: " + path : "") + (expression ? " expression: " + expression : ""));
        if (path) {
            return readPath(json, path.split('.'));
        } else if (expression) {
            return readExpression(json, expression);
        }
    }

    function readPath(json, path) {
        console.log("readPath - json: " + JSON.stringify(json, null, 2) + (path ? " path: " + path : ""));
        if (path && json) {
            if (path.length === 1) {
                console.log("readPath - result: " + json[path[0]]);
                return json[path[0]] || '';
            } else {
                return readPath(json[path[0]], path.splice(1));
            }
        } else {
            return '';
        }
    }

    function readExpression(json, expression) {
        console.log("readExpression - json: " + JSON.stringify(json, null, 2) + (expression ? " expression: " + expression : ""));
        if (readExpression && json) {
            var subPath = /\$\{[a-zA-Z0-9\-\_\.]*\}/.exec(expression);
            if (subPath) {
                var newExpression = expression.replace(subPath, readPath(json, (/[a-zA-Z0-9\-\_\.]+/.exec(subPath)[0]).split('.')));
                return readExpression(json, newExpression);
            } else {
                console.log("readPath - result: " + json[path[0]]);
                return (expression || '').trim();
            }
        } else {
            return '';
        }
    }

    var module_directory = module.filename.replace("information-radiator.js", "");

    var routing = function (req, res) {
        var uri = url.parse(req.url).pathname,
            filename = url.parse(req.url).path;

        console.log("serving file: " + uri);
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
                res.write(JSON.stringify(nconf.get('config'), null, 2));
                res.end();
            } else if (uri === '/data.json' && req.method === 'POST') {

                handlePostRequest(function (requestBody) {
                    console.log("post: " + JSON.stringify(requestBody, null, 2));
                    var options = {
                        host: url.parse(requestBody.url).hostname,
                        port: url.parse(requestBody.url).port,
                        path: url.parse(requestBody.url).path
                    };
                    http.request(options, handlePostRequest(function (responseBody, request) {
                        console.log("response: " + JSON.stringify(responseBody, null, 2));
                        res.writeHead(request.statusCode, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache, no-store'});
                        res.write(JSON.stringify({
                            value: readValue(responseBody, requestBody.path, requestBody.expression),
                            match: (requestBody.condition ? readValue(responseBody, requestBody.condition.path, requestBody.condition.expression) === requestBody.condition.value : true)
                        }));
                        res.end();
                    })).on('error', function (e) {
                        console.log('problem making request to ' + requestBody.url + ' => ' + e.message);
                    }).end();
                })(req);
            }
        } catch (e) {
            console.log("error: " + e);
        }
    };

    http.createServer(routing).listen(8080);

    if (nconf.get('verbose')) {
        console.log('The configured pipelines are...\n\n' + JSON.stringify(nconf.get('layout'), null, 2));
        console.log("information-radiator starting on port: " + 8080);
    }
};
