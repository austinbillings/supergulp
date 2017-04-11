const zaq = require('zaq');
const exec = require('child_process').exec;

module.exports = (gulp, config, hook) => {
  gulp.task('serve', () => {
    if (config.lacks(['port', 'siteRoot'], 'serve, default, go, dev')) return;
    
    zaq.info(`Static server starting on :${config.port}. . .`);
  	exec(`asdf -p ${config.port} -d ${config.siteRoot}`, () => '');
  });
  
  hook('serve', ['default', 'go', 'dev']);
};