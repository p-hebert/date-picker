var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var include = require('gulp-include');
var sass = require('gulp-sass');
var minifyCss = require('gulp-cssnano');
var rename = require('gulp-rename');

var paths = {
  sass: ['./src/scss/**/*.scss'],
  js: ['./src/js/date-picker.js']
};

gulp.task('default', ['sass', 'js']);

gulp.task('js', function(done) {
  gulp.src(paths.js)
  .pipe(include())
    .on('error', console.log)
  .pipe(gulp.dest("./src/"))
  .on('end', done);
});

gulp.task('sassmin', function(done) {
  gulp.src(paths.sass)
      .pipe(sass({
        errLogToConsole: true
      }))
      .pipe(minifyCss({
        keepSpecialComments: 0
      }))
      .pipe(rename({ extname: '.min.css' }))
      .pipe(gulp.dest('./src'))
      .on('end', done);
});

gulp.task('sass', function(done) {
  gulp.src(paths.sass)
      .pipe(sass({
        errLogToConsole: true
      }))
      .pipe(rename({ extname: '.css' }))
      .pipe(gulp.dest('./src'))
      .on('end', done);
});
