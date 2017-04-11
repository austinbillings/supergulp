const zaq = require('zaq');
const open = require('open');

module.exports = (gulp, config, hook) => {
  gulp.task('open', () => {
    if (config.lacks(['port', 'sitePath'], 'open')) return;
    
    zaq.info('Opening in browser. . .');
    open(`http://localhost:${config.port}/${config.sitePath || ''}`);
  });
  
  if (config.lacks(['port', 'sitePath'], ['go', 'dev'])) return;
  else hook('open', ['go', 'dev']);
}