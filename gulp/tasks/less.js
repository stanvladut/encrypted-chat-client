'use strict';

var autoprefixer  = require('gulp-autoprefixer');
var less          = require('gulp-less');
var sourcemaps    = require('gulp-sourcemaps');

var config      = require('./config');
var handleError = require('../util/handleErrors');

module.exports = function(gulp) {
  gulp.task('less', function() {
    return gulp.src(config.source.less)
      .pipe(less({
        sourcemapPath: './',
        bundleExec: true,
        style: 'compressed'
      }))
      .on('error',handleError)
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(config.dest.css));
  });
};
