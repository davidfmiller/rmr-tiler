module.exports = function(grunt) {

  'use strict';

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      js: {
        options: {
          mangle: true
        },
        files: {
          'docs/tiler.js' : ['src/tiler.js']
        }
      }
    },

    compass : {
      dist : {
        options : {
          sassDir : 'src/',
          cssDir : 'docs',
          environment : 'production',
          outputStyle : 'compressed'
        }
      }
    },

    watch : {
      css : {
        files : ['src/*.scss'],
        tasks : ['compass']
      },
      js : {
        files : ['src/*.js'],
        tasks : ['uglify']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['compass']);
};
