const zaq = require('zaq');
const path = require('path');
const chalk = require('chalk');
const jawn = require('node-jawn');
const less = require('gulp-less');
const merge = require('merge-stream');
const concat = require('gulp-concat');
const minCss = require('gulp-uglifycss');
const replace = require('gulp-replace');

module.exports = (gulp, config, hook) => {
  if (!config.lacks(['sources.vendor.css', 'sources.vendor.less'], 'vendor-css')) return;
  
  gulp.task('vendor-css', () => {  
    zaq.info('Bundling CSS libs. . .');
    let unprocessed = gulp.src(config.sources.vendor.css || '');
    let processed = gulp.src(config.sources.vendor.less || '')
  		.pipe(less({ paths: [ path.join(__dirname, 'less', 'includes')] }))
      .pipe(replace(/url\('[^\']*fonts\//gi, 'url(\'dist/fonts/'));

    merge(unprocessed, processed)
      .pipe(concat(config.filenames.vendor.css))
      .pipe(minCss({uglyComments: true, maxLineLen: 500}))
      .pipe(gulp.dest(config.output));
    zaq.weight(config.output, config.filenames.vendor.css);
  });
  
  hook('vendor-css', ['deps', 'build']);
}