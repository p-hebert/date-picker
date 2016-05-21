var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var include = require('gulp-include');
var sass = require('gulp-sass');
var minifyCss = require('gulp-cssnano');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var paths = {
  sass: ['./src/scss/**/*.scss'],
  js: ['./src/js/date-picker.js']
};

gulp.task('default', ['dev-sass', 'dev-js']);

gulp.task('dist', ['dist-sass', 'dist-js']);
gulp.task('distmin', ['dist-sassmin', 'dist-jsmin']);

gulp.task('dev-js', function(done) {
  gulp.src(paths.js)
  .pipe(include())
    .on('error', console.log)
  .pipe(gulp.dest("./src/"))
  .on('end', done);
});

gulp.task('dist-js', function(done) {
  gulp.src(paths.js)
  .pipe(include())
    .on('error', console.log)
  .pipe(gulp.dest("./dist/"))
  .on('end', done);
});

gulp.task('dist-jsmin', function(done) {
  gulp.src(paths.js)
  .pipe(include())
    .on('error', console.log)
  .pipe(uglify(false))
  .pipe(rename({ extname: '.min.js' }))
  .pipe(gulp.dest("./dist/"))
  .on('end', done);
});

gulp.task('dev-sass', function(done) {
  gulp.src(paths.sass)
      .pipe(sass({
        errLogToConsole: true
      }))
      .pipe(rename({ extname: '.css' }))
      .pipe(gulp.dest('./src'))
      .on('end', done);
});

gulp.task('dist-sass', function(done) {
  gulp.src(paths.sass)
      .pipe(sass({
        errLogToConsole: true
      }))
      .pipe(rename({ extname: '.css' }))
      .pipe(gulp.dest('./dist'))
      .on('end', done);
});

gulp.task('dist-sassmin', function(done) {
  gulp.src(paths.sass)
      .pipe(sass({
        errLogToConsole: true
      }))
      .pipe(minifyCss({
        keepSpecialComments: 0
      }))
      .pipe(rename({ extname: '.min.css' }))
      .pipe(gulp.dest('./dist'))
      .on('end', done);
});
