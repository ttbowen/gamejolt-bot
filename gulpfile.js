'use strict';

const gulp = require('gulp');
const gulp_ts = require('gulp-typescript');
const gulp_ts_lint = require('gulp-tslint');
const gulp_sourcemaps = require('gulp-sourcemaps');
const tslint = require('tslint');
const del = require('del');
const path = require('path');

const project = gulp_ts.createProject('tsconfig.json');
const linter = tslint.Linter.createProgram('tsconfig.json');

gulp.task('default', ['build-ts']);

gulp.task('ts-lint', () => {
  gulp
    .src('./src/**/*.ts')
    .pipe(
      gulp_ts_lint({
        configuration: 'tslint.json',
        formatter: 'prose',
        program: linter
      })
    )
    .pipe(gulp_ts_lint.report());
});

gulp.task('watch', () => {
  gulp.watch(['./src/**/*.ts'], ['ts-lint', 'build-ts']);
});

gulp.task('build-ts', () => {
  del.sync(['./dist/**/*.*']);

  const tsCompile = gulp
    .src('./src/**/*.ts')
    .pipe(gulp_sourcemaps.init())
    .pipe(project());

  tsCompile.pipe(gulp.dest('dist/'));

  gulp.src('./src/**/*.js').pipe(gulp.dest('dist/'));
  gulp.src('./src/**/*.json').pipe(gulp.dest('dist/'));

  return tsCompile.js
    .pipe(
      gulp_sourcemaps.write({
        sourceRoot: file => path.relative(path.join(file.cwd), file.base)
      })
    )
    .pipe(gulp.dest('dist/'));
});

gulp.task('build:tests', () => {
  del.sync(['./tests/**/*.js']);
  gulp
    .src('./tests/**/*.ts')
    .pipe(
      gulp_ts({
        experimentalDecorators: true,
        module: 'commonjs',
        target: 'es6',
        lib: ['es7']
      })
    )
    .pipe(gulp.dest('./tests/'));
});
