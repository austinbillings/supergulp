const zaq = require('zaq');
const chalk = require('chalk');
const path = require('path');
const copy = require('gulp-copy');

module.exports = (gulp, config, hook) => {
  if (config.lacks('sources.vendor.fonts', 'vendor-fonts'));
  
  gulp.task('vendor-fonts', () => {
    
    if (!jawn.hath(config, 'vendor.fonts')) {
      return zaq.warn(`No CSS Libs: ${chalk.yellow.dim('[config.vendor.fonts]')}`);
    }
    
    zaq.info('Bundling lib font files. . .');
    return gulp.src(config.sources.vendor.fonts)
      .pipe(copy(path.join(config.output, '/fonts'), {prefix: 4}));
  });
  
  hook('vendor-fonts', ['deps', 'build']);
}