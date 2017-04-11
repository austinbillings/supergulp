const zaq = require('zaq');
const exec = require('child_process').exec;
  
module.exports = (gulp, config, hook) => {
  gulp.task('atomize', () => {
    zaq.info('Opening project in Atom . . .');
    return exec('atom .');
  });
  
  hook('atomize', 'dev');
}