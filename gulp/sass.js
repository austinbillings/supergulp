const zaq = require('zaq');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglifycss');

module.exports = (gulp, config, hook) => {
  gulp.task('sass', () => {
    if (config.lacks([ 'sources.sass', 'filenames.sass', 'output' ], 'sass')) return;
    
  	zaq.info('Compiling Sass. . .');
  	gulp.src(config.sources.sass)
  		.pipe(concat(config.filenames.sass))
  		.pipe(sass().on('error', sass.logError))
      .pipe(uglify())
  		.pipe(gulp.dest(config.output));
    zaq.weight(config.output, config.filenames.sass);
  });
  
  if (config.lacks([ 'sources.sass', 'filenames.sass', 'output' ], 'default, go, dev, build')) return;
  hook('sass', ['default', 'go', 'dev'], config.sources.sass);
  hook('sass', 'build');
}