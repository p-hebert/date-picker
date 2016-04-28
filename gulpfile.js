var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var sass = require('gulp-sass');
var minifyCss = require('gulp-cssnano');
var rename = require('gulp-rename');

var paths = {
  sass: ['./src/scss/**/*.scss'],
};

gulp.task('default', ['sass']);

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
