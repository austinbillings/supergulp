const zaq = require('zaq');
const imagemin = require('gulp-imagemin');

module.exports = (gulp, config) => {
  gulp.task('optimize', () => {
    if (config.lacks('sources.images', 'optimize')) return;
    
    zaq.info(`Optimizing image files. . .`)
    return gulp.src(config.sources.images)
      .pipe(imagemin())
      .pipe(gulp.dest(path => path.base));
  });
};