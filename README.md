# information-radiator 
[![Build Status](https://secure.travis-ci.org/jamesdbloom/information-radiator.png?branch=master)](http://travis-ci.org/jamesdbloom/information-radiator) [![Dependency Status](https://david-dm.org/jamesdbloom/information-radiator.png)](https://david-dm.org/jamesdbloom/information-radiator) [![devDependency Status](https://david-dm.org/jamesdbloom/information-radiator/dev-status.png)](https://david-dm.org/jamesdbloom/information-radiator#info=devDependencies) [![Code Climate](https://codeclimate.com/github/jamesdbloom/information-radiator.png)](https://codeclimate.com/github/jamesdbloom/information-radiator) [![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/jamesdbloom/information-radiator/trend.png)](https://bitdeli.com/free "Bitdeli Badge") [![Stories in Backlog](https://badge.waffle.io/jamesdbloom/information-radiator.png?label=backlog&title=Backlog)](https://waffle.io/jamesdbloom/information-radiator)

[![NPM](https://nodei.co/npm/information-radiator.png?downloads=true&stars=true)](https://nodei.co/npm/information-radiator/)

Information radiator to clearly visualize continuous delivery pipelines

## Getting Started
- Install the module with: `npm install information-radiator`

- Provide configuration in a file called `./config.json` and add the following code:

```javascript
var information_radiator = require('information-radiator');
information_radiator.run();
```

- Or provide configuration as a parameter to the `run()` method as follows:

```javascript
var information_radiator = require('information-radiator');
information_radiator.run(
{
  title: "Main Page Title",
  groups: [
    {
      name: "pipeline group name",
      headers: ['stage one header', 'stage two header'],
      pipelines: [
        {
          stages: [
            {
              url: 'http://build.server.com/job/ms/lastSuccessfulBuild/api/json',
              path: 'number',
              link: 'http://build.server.com/job/ms/lastSuccessfulBuild',
              condition: {
                path: 'result',
                value: 'SUCCESS'
              }
            },
            {
              url: 'http://dev.jamesdbloom.com/info.json?json',
              expression: '${project.id} ${project.version} ${build.number}',
              link: 'http://dev.jamesdbloom.com'
            }
          ]
        }
      ]
    }
  ]
});
```

For more details on the format of the configuration see below...

## Overview

This module can be used to create an information radiator to clearly visualize your continuous delivery pipelines.  A typical screen might look as follows:

![Example Build Pipeline](https://github.com/jamesdbloom/information-radiator/raw/master/docs/images/build_pipeline_screenshot.png)

All aspects of this screen are configurable.  The configuration used to build this screen is as follows:

```javascript
require('information-radiator').run({
  pollPeriod: 60,
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
              url: 'http://build.server.com/job/ms/lastSuccessfulBuild/api/json',
              path: 'number',
              link: 'http://build.server.com/job/ms/lastSuccessfulBuild',
              condition: {
                path: 'result',
                value: 'SUCCESS'
              }
            },
            {
              url: 'http://dev.jamesdbloom.com/info.json?json',
              expression: '${project.id} ${project.version} ${build.number}',
              condition: {
                expression: '${Application.Project-Artifact-Id}',
                value: 'evolve'
              },
              link: 'http://dev.jamesdbloom.com'
            },
            {
              url: 'http://qa.jamesdbloom.com/info.json?json',
              expression: '${project.id} ${project.version} ${build.number}',
              link: 'http://qa.jamesdbloom.com'
            },
            {
              url: 'http://uat.jamesdbloom.com/info.json?json',
              expression: '${project.id} ${project.version} ${build.number}',
              link: 'http://uat.jamesdbloom.com/info.json?json'
            },
            {
              url: 'http://prod.jamesdbloom.com/info.json?json',
              expression: '${project.id} ${project.version} ${build.number}',
              link: 'http://prod.jamesdbloom.com/info.json?json'
            }
          ]
        },
        {
          stages: [
            {
              url: 'http://build.server.com/job/ms/lastSuccessfulBuild/api/json',
              path: 'number',
              link: 'http://build.server.com/job/ms/lastSuccessfulBuild',
              condition: {
                path: 'result',
                value: 'SUCCESS'
              }
            },
            {
              url: 'http://dev.jamesdbloom.com/info.json?json',
              expression: '${project.id} ${project.version} ${build.number}',
              condition: {
                expression: '${Application.Project-Artifact-Id}',
                value: 'evolve'
              }
            },
            {
              url: 'http://qa.jamesdbloom.com/info.json?json',
              expression: '${project.id} ${project.version} ${build.number}'
            },
            {
              url: 'http://uat.jamesdbloom.com/info.json?json',
              expression: '${project.id} ${project.version} ${build.number}'
            },
            {
              url: 'http://prod.jamesdbloom.com/info.json?json',
              expression: '${project.id} ${project.version} ${build.number}'
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
              url: 'http://build.server.com/job/ms/lastSuccessfulBuild/api/json',
              path: 'number',
              condition: {
                path: 'result',
                value: 'SUCCESS'
              }
            },
            {
              url: 'http://dev.jamesdbloom.com/info.json?json',
              expression: '${project.id} ${project.version} ${build.number}',
              condition: {
                expression: '${Application.Project-Artifact-Id}',
                value: 'evolve'
              }
            },
            {
              url: 'http://qa.jamesdbloom.com/info.json?json',
              expression: '${project.id} ${project.version} ${build.number}'
            },
            {
              url: 'http://uat.jamesdbloom.com/info.json?json',
              expression: '${project.id} ${project.version} ${build.number}'
            }
          ]
        },
        {
          stages: [
            {
              url: 'http://build.server.com/job/ms/lastSuccessfulBuild/api/json',
              path: 'number',
              condition: {
                path: 'result',
                value: 'SUCCESS'
              }
            },
            {
              url: 'http://dev.jamesdbloom.com/info.json?json',
              expression: '${project.id} ${project.version} ${build.number}',
              condition: {
                expression: '${Application.Project-Artifact-Id}',
                value: 'evolve'
              }
            },
            {
              url: 'http://qa.jamesdbloom.com/info.json?json',
              expression: '${project.id} ${project.version} ${build.number}'
            },
            {
              url: 'http://uat.jamesdbloom.com/info.json?json',
              expression: '${project.id} ${project.version} ${build.number}'
            }
          ]
        }
      ]
    }
  ]
});
```

## Configuration

```javascript
The basic structure of the configuration is as follows:

{
  // the port to run the server on
  port: 8080,
  // how often in seconds should stages be polled
  pollPeriod: 10,
  // should refresh button be shown
  refresh: true,
  title: "Main Page Title",
  groups: [
    {
      name: "pipeline group name",
      // header for each stage
      headers: ['stage one header', 'stage two header', ...],
      pipelines: [
        {
          stages: [
            {
              // url to fetch json from
              url: 'http://127.0.0.1:9090/example.json',
              // simple field to read from json
              path: '...',
              // causes browser to navigate to this url when the stage is clicked
              link: 'http://127.0.0.1:9090'
            },
            {
              // url to fetch json from
              url: 'http://127.0.0.1:9090/info?json',
              // complex expression to read from json
              expression: '${...} ${...}',
              // additional condition to trigger success or failure state
              condition: {
                // complex expression (for simple field access use \'path\' instead)
                expression: '${...} ${...}',
                // value to match
                value: '...'
              }
            },
            ...
          ]
        },
        // another pipeline with the same stages (sharing same set of headers)
        ...
      ]
    },
    // another new type of pipeline group (different stage headers)
    ...
  ]
}
```

#### port
Type: `Integer`
Default value: `8080`

This value specifies the port to run the server on.

#### pollPeriod
Type: `Integer`
Default value: `10`

This value specifies how often the stages should be polled to retrieve there status.

#### refresh
Type: `Boolean`
Default value: `false`

This value specifies whether the refresh button should appear in the top left hand corner.

#### title
Type: `String`
Default value: ``

This value specifies the main title that appears at the top of the page.  If not value is provided no title will appear at the top of the page.

#### groups
Type: `Array`
Default value: `[]`

This value specifies the list of pipeline groups to display.

#### groups[i].name
Type: `String`
Default value: ``

This value specifies the name of the pipeline group that will appear in the border around the pipeline group.

#### groups[i].headers
Type: `Array`
Default value: ``

This value specifies the list of stage names that appear in the header row for a pipeline group.

#### groups[i].pipelines
Type: `Array`
Default value: ``

This value specifies the list of pipelines, each with there own set of stages (that should match the list of headers for the same pipeline group).

#### groups[i].pipelines[i].stages
Type: `Array`
Default value: ``

This value specifies the list of stages within a given pipeline.

#### groups[i].pipelines[i].stages[i].url
Type: `String`
Default value: ``

This value specifies the url to fetch JSON data from.

#### groups[i].pipelines[i].stages[i].path
Type: `String`
Default value: ``

This value specifies a simple field path to retrieve a value from a JSON response.  The retrieved value is then displayed in the box representing the stage.  When a stage fails then the previous successful value is also displayed in the box.  Either *path* or *expression* can be used to retrieve a the value that is displayed, however if both are specified path will take precedence and expression will be ignored.

#### groups[i].pipelines[i].stages[i].expression
Type: `String`
Default value: ``

This value specifies a complex expression to retrieve one or more values from a JSON response.  The expression can contain any string, where each *${...}* value is replace with the corresponding value read from the json.  Nested *${...}* are not supported.  The retrieved value is then displayed in the box representing the stage.  When a stage fails then the previous successful value is also displayed in the box.  Either *path* or *expression* can be used to retrieve a the value that is displayed, however if both are specified path will take precedence and expression will be ignored.

#### groups[i].pipelines[i].stages[i].condition
Type: `String`
Default value: ``

This value specifies a condition to determine whether a stage is passing or failing.  The condition can be specified using either a path or expression and a value to match against.  In addition to the condition specified a section will go orange if an empty body is received from the url or red if an error state is returned such as 404, 500 or an illegally formatted response.

#### groups[i].pipelines[i].stages[i].condition.path
Type: `String`
Default value: ``

This value specifies a simple field path to retrieve for this condition.  The retrieved value is then matched against the condition value specified in *groups[i].pipelines[i].stages[i].condition.value*.

#### groups[i].pipelines[i].stages[i].condition.expression
Type: `String`
Default value: ``

This value specifies a complex expression to retrieve for this condition.  The retrieved expression is then matched against the condition value specified in *groups[i].pipelines[i].stages[i].condition.value*.

#### groups[i].pipelines[i].stages[i].condition.value
Type: `String`
Default value: ``

This value specifies a value to match for this condition.  This value is matched against either the path or expression (which ever is specified, or path if both are specified).

#### groups[i].pipelines[i].stages[i].link
Type: `String`
Default value: ``

This value specifies a url that turns the box representing the box into a link to the url.  Clicking the stage will cause the same window to navigate to the url.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
 * 2014-06-05   v0.1.0   Released information-radiator module
 * 2014-06-06   v0.1.1   Improving documentation
 * 2014-06-06   v0.1.2   Improving documentation

## License
Copyright (c) 2014 [James D Bloom](http://blog.jamesdbloom.com)  
Licensed under the MIT license.
