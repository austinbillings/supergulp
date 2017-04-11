module.exports = (gulp, config, hook, root) => {
  gulp.task("libs", () => {
    return gulp.src([
        'core-js/client/shim.min.js',
        'systemjs/dist/system-polyfills.js',
        'systemjs/dist/system.src.js',
        'reflect-metadata/Reflect.js',
        'rxjs/**/*.js',
        'zone.js/dist/**',
        '@angular/**/bundles/**'
      ], {cwd: 'node_modules/**'})
      .pipe(gulp.dest('build/lib'));
  });
}