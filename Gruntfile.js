/*
 * grunt-awsebtdeploy
 * https://github.com/simoneb/grunt-awsebtdeploy
 *
 * Copyright (c) 2014 Simone Busoli
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
  var exec = require('child_process').exec,
      credentials = require('grunt-awsebtdeploy-credentials');

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    awsebtdeploy: {
      demo: {
        options: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          region: 'eu-west-1',
          applicationName: 'awsebtdeploy-demo',
          environmentName: 'awsebtdeploy-demo-env',
          wait: true
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('deploy', ['clean', 'createS3Key', 'createSourceBundle', 'awsebtdeploy']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'deploy', 'nodeunit']);

  grunt.registerTask('createS3Key', function () {
    var done = this.async();

    exec('git describe --always --dirty=-' + new Date().getTime(), function (err, stdo, stde) {
      if (err) return done(err);

      grunt.config('s3key', stdo.toString().trim());
      done();
    });
  });

  grunt.registerTask('createSourceBundle', function () {
    var done = this.async(),
        sourceBundle = 'tmp/' + grunt.config('s3key') + '.zip';

    grunt.file.mkdir('tmp');
    exec('git archive HEAD --format zip -o ' + sourceBundle,
        function (err) {
          if (err) return done(err);

          grunt.config('awsebtdeploy.demo.options.sourceBundle', sourceBundle);
          done();
        });
  });

};