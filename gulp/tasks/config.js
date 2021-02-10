'use strict';

var buildFolder = '.';
var srcFolder = 'src';

module.exports = {

  build: buildFolder,
  src: srcFolder,

  bundles: {
    js: 'bundle.js',
    template: 'components.js',
    css: 'styles.css'
  },

  appEntry: './' + srcFolder + '/js/start.js',

  source: {
    html: [ srcFolder + '/*.html' ],
    img: [
      srcFolder + '/img/**/*',
      srcFolder + '/img/*'
    ],
    svg: [
      srcFolder + '/img/svg/*.svg',
    ],
    less: [
      srcFolder + '/less/**/*.less',
      srcFolder + '/less/*.less'
    ],
    css: [
      'libs/*.css',
      srcFolder + '/css/libs/*.css',
      srcFolder + '/css/**/*.css',
      srcFolder + '/css/*.css'
    ],
    font: [ srcFolder + '/fonts/*' ],
    jshint: [
      srcFolder + '/js/**/*.js',
      srcFolder + '/js/*.js'
    ],
    browserify: [
      srcFolder + '/js/**/*.js',
      srcFolder + '/js/*.js',
      srcFolder + '/js/templates/**/*.html',
      srcFolder + '/js/templates/*.html'
    ]
  },

  dest: {

    defaults: {
      css: srcFolder + '/css/',
      less: srcFolder + '/less/'
    },

    html: buildFolder + '/',
    img: buildFolder + '/img/',
    less: buildFolder + '/less/',
    css: buildFolder + '/css/',
    font: buildFolder + '/fonts/',
    js: buildFolder + '/js/',

  }

};
