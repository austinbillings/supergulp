const zaq = require('zaq');
const del = require('del');

module.exports = (gulp, config, hook) => {
  gulp.task('clean', () => {
    if (config.lacks('output', 'clean')) return;
    
    zaq.info('Cleaning build directory. . .')
    return del(config.output + '/**/*');
  });
}