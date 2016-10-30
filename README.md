gulp-assets-injector
===

![NPM](https://img.shields.io/npm/v/gulp-assets-injector.svg)
![License](https://img.shields.io/npm/l/gulp-assets-injector.svg)
![Downloads](https://img.shields.io/npm/dt/gulp-assets-injector.svg)

A plugin to inject assets into HTMLs.

Usage
---
First collect static files via `assetsInjector.collect()`, then inject them
via `assetsInjector.inject()`.

``` js
const gulp = require('gulp');
const assetsInjector = require('gulp-assets-injector')();

gulp.task('js', () => {
  return gulp.src('src/**/*.js')
  .pipe(assetsInjector.collect())
  .pipe(gulp.dest('dist'));
});

gulp.task('css', () => {
  return gulp.src('src/**/*.css')
  .pipe(assetsInjector.collect())
  .pipe(gulp.dest('dist'));
});

gulp.task('html', ['js', 'css'], () => {
  return gulp.src('src/index.html')
  .pipe(assetsInjector.inject())
  .pipe(gulp.dest('dist'));
});

// and a more complexed example
gulp.task('html-complex', ['js', 'css'], () => {
  return gulp.src('src/home.html')
  .pipe(assetsInjector.inject({
    link: true,
    filter: (htmlPath, assetPath) => assetPath.includes('/home/'),
  }))
  .pipe(gulp.dest('dist'));
});
```

Document
---

* AssetsInjector

  The constructor takes no arguments.

* AssetsInjector::collect()

  Collects all the static files piped to it.

* AssetsInjector::inject(*Optional* options)

  Inject the collected static files to the piped HTMLs.

  `options` is an object with following properties:

  * link: *Any*

    Whether the assets should be injected as a link. If set to false, the content will be injected into HTML directly. Default as `true`.

    If set to a function, the injected link URL will be determined by the function, the parameters are `path/to/HTML` and `path/to/asset`.

  * filter: *Function*

    A function to decide whether an asset file should be injected into the current HTML. The parameters are `path/to/HTML` and `path/to/asset`.

    If not provided, all assets within the same directory as the current HTML will be injected.
