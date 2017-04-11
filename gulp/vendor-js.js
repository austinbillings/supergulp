const zaq = require('zaq');
const chalk = require('chalk');
const jawn = require('node-jawn');
const concat = require('gulp-concat');
const strip = require('gulp-strip-comments');

module.exports = (gulp, config, hook) => {
  if (config.lacks('souces.vendor.js', 'vendor-js')) return;
  
  gulp.task('vendor-js', () => {    
    zaq.info('Bundling JS libs. . .');
    gulp.src(config.sources.vendor.js)
      .pipe(concat(config.filenames.vendor.js))
      .pipe(strip())
      .pipe(gulp.dest(config.output));
    zaq.weight(config.output, config.filenames.vendor.js);
  });
  hook('vendor-js', ['deps', 'build']);
}