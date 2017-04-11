const zaq = require('zaq');
const chalk = require('chalk');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

module.exports = (gulp, config, hook) => {  
  
  gulp.task('es6', () => {
    if (config.lacks('sources.es6', 'es6')) return;

  	zaq.info('Compiling Frontend. . .');
  	gulp.src(config.sources.es6)
  		.pipe(babel({ presets: ['env'] }))
  		.pipe(concat(config.filenames.es6))
      .pipe(uglify())
  		.pipe(gulp.dest(config.output));
    zaq.weight(config.output, config.filenames.es6);
  });
  
  if (config.lacks('sources.es6', ['default', 'go', 'dev', 'build'])) return;
  hook('es6', ['default', 'go', 'dev'], config.sources.es6);
  hook('es6', 'build');
}