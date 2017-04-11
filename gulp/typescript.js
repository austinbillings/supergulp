const tsc = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

module.exports = (gulp, config, hook, root) => {
  if (config.lacks(['sources.ts', 'sources.typings', 'sources.tsSourceRoot'], 'typescript')) return;

  let sources = {
    ts: config.sources.ts, 
    typings: config.sources.typings
  };
  
  gulp.task('typescript', ['tslint'], () => {
    let tsResult = gulp.src(sources.ts)
      .pipe(sourcemaps.init())
      .pipe(tsProject());
    return tsResult.js
      .pipe(sourcemaps.write('.', { sourceRoot: config.sources.tsSourceRoot }))
      .pipe(gulp.dest(config.output));
  });
  
}