require('./lib/information-radiator').run({
    port: 8080,
    pollPeriod: 5,
    refresh: true,
    title: "Build Pipeline",
    groups: [
        {
            name: "front-end",
            headers: ['build', 'development', 'qa', 'uat', 'production'],
            pipelines: [
                {
                    stages: [
                        {
                            name: 'build',
                            url: 'http://127.0.0.1:9090/example.json',
                            path: 'build.number',
                            link: 'http://127.0.0.1:9090/example.json'
                        },
                        {
                            name: 'development',
                            url: 'http://127.0.0.1:9090/info.json?json',
                            expression: '${Application.Project-Artifact-Id} ${Application.Project-Version} ${Application.Jenkins-Build-Number}',
                            condition: {
                                expression: '${Application.Project-Artifact-Id}',
                                value: 'evolve'
                            },
                            link: 'http://127.0.0.1:9090/info.json?json'
                        },
                        {
                            name: 'qa',
                            url: 'http://127.0.0.1:9090/info.json?json',
                            expression: '${Application.Project-Artifact-Id} ${Application.Project-Version} ${Application.Jenkins-Build-Number}',
                            link: 'http://127.0.0.1:9090/info.json?json'
                        },
                        {
                            name: 'uat',
                            url: 'http://127.0.0.1:9090/info.json?json',
                            expression: '${Application.Project-Artifact-Id} ${Application.Project-Version} ${Application.Jenkins-Build-Number}',
                            condition: {
                                expression: '${Application.Project-Artifact-Id}',
                                value: 'something else'
                            },
                            link: 'http://127.0.0.1:9090/info.json?json'
                        },
                        {
                            name: 'production',
                            url: 'http://127.0.0.1:9090/info.json?json',
                            expression: '${Application.Project-Artifact-Id} ${Application.Project-Version} ${Application.Jenkins-Build-Number}',
                            link: 'http://127.0.0.1:9090/info.json?json'
                        }
                    ]
                },
                {
                    stages: [
                        {
                            name: 'build',
                            url: 'http://127.0.0.1:9090/example.json',
                            path: 'build.number'
                        },
                        {
                            name: 'development',
                            url: 'http://127.0.0.1:9090/info.json?json',
                            expression: '${Application.Project-Artifact-Id} ${Application.Project-Version} ${Application.Jenkins-Build-Number}'
                        },
                        {
                            name: 'qa',
                            url: 'http://127.0.0.1:9090/info.json?json',
                            expression: '${Application.Project-Artifact-Id} ${Application.Project-Version} ${Application.Jenkins-Build-Number}'
                        },
                        {
                            name: 'uat',
                            url: 'http://127.0.0.1:9090/info.json?json',
                            expression: '${Application.Project-Artifact-Id} ${Application.Project-Version} ${Application.Jenkins-Build-Number}'
                        },
                        {
                            name: 'production',
                            url: 'http://127.0.0.1:9090/info.json?json',
                            expression: '${Application.Project-Artifact-Id} ${Application.Project-Version} ${Application.Jenkins-Build-Number}'
                        }
                    ]
                }
            ]
        },
        {
            name: "back-end",
            headers: ['build', 'development', 'qa', 'uat'],
            pipelines: [
                {
                    stages: [
                        {
                            name: 'build',
                            url: 'http://127.0.0.1:9090/example.json',
                            path: 'build.number'
                        },
                        {
                            name: 'development',
                            url: 'http://127.0.0.1:9090/info.json?json',
                            expression: '${Application.Project-Artifact-Id} ${Application.Project-Version} ${Application.Jenkins-Build-Number}'
                        },
                        {
                            name: 'qa',
                            url: 'http://127.0.0.1:9090/info.json?json',
                            expression: '${Application.Project-Artifact-Id} ${Application.Project-Version} ${Application.Jenkins-Build-Number}'
                        },
                        {
                            name: 'uat',
                            url: 'http://127.0.0.1:9090/info.json?json',
                            expression: '${Application.Project-Artifact-Id} ${Application.Project-Version} ${Application.Jenkins-Build-Number}'
                        }
                    ]
                },
                {
                    stages: [
                        {
                            name: 'build',
                            url: 'http://127.0.0.1:9090/example.json',
                            path: 'build.number'
                        },
                        {
                            name: 'development',
                            url: 'http://127.0.0.1:9090/info.json?json',
                            expression: '${Application.Project-Artifact-Id} ${Application.Project-Version} ${Application.Jenkins-Build-Number}'
                        },
                        {
                            name: 'qa',
                            url: 'http://127.0.0.1:9090/info.json?json',
                            expression: '${Application.Project-Artifact-Id} ${Application.Project-Version} ${Application.Jenkins-Build-Number}'
                        },
                        {
                            name: 'uat',
                            url: 'http://127.0.0.1:9090/info.json?json',
                            expression: '${Application.Project-Artifact-Id} ${Application.Project-Version} ${Application.Jenkins-Build-Number}'
                        }
                    ]
                }
            ]
        }
    ]
});

function randomNumber(length) {
    var str = "";
    for (var i = 0; i < (length || Math.floor((Math.random() * 10) + 1)); ++i) {
        str += 65 + Math.floor(Math.random() * 26);
    }
    return str;
}

// simple test server used for development and unit tests
require('http').createServer((req, res) => {
    var uri = require('url').parse(req.url).path;
    var response = {};
    var statusCode = 200;

    console.log("Test server received request: " + uri);
    if (uri === '/example.json' && req.method == 'GET') {
        if (Math.floor((Math.random() * 10) + 1) < 2) {
            statusCode = 500;
        } else if (Math.floor((Math.random() * 10) + 1) <= 7) {
            response = {
                build: {
                    number: randomNumber()
                }
            };
        }
    } else if (uri === '/info.json?json' && req.method == 'GET') {
        if (Math.floor((Math.random() * 10) + 1) < 2) {
            statusCode = 500;
        } else if (Math.floor((Math.random() * 10) + 1) <= 7) {
            response = {
                Application: {
                    'Project-Artifact-Id': (Math.floor((Math.random() * 10) + 1) <= 7 ? 'evolve' : 'something else'),
                    'Project-Version': '3.1',
                    'Jenkins-Build-Number': randomNumber(4)
                }
            };
        }
    }

    console.log("statusCode: " + statusCode);
    res.writeHead(statusCode, {'Content-Type': 'application/json', 'Cache-Control': 'no-cache, no-store'});
    res.write(JSON.stringify(response));
    res.end();
}).listen(9090);