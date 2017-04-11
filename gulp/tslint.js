const tslint = require('gulp-tslint');

module.exports = (gulp, config, hook, root) => {
  gulp.task('tslint', () => {
    if (config.lacks('sources.ts', 'tslint')) return;
    
    return gulp.src(config.sources.ts)
      .pipe(tslint({ formatter: 'prose' }))
      .pipe(tslint.report());
  });
}