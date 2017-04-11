const zaq = require('zaq');
const _ = require('underscore');
const filter = require('gulp-filter');
const rename = require('gulp-rename');
const imageResize = require('gulp-image-resize');

module.exports = (gulp, config) => {
	if (config.lacks('sources.photos', 'thumbs')) return;

	let height = 400;
	let suffix = '-thumb';
	let match = [`**`, `!**/*${suffix}.jpg`];

	let defaults = { height, suffix, match };
	let settings = _.defaults(config.thumbnails, defaults);
	
	gulp.task('thumbs', () => {
		zaq.info(`Generating thumnails at ${height}px. . .`);
		return gulp.src(config.sources.photos)
			.pipe(filter(settings.match))
			.pipe(imageResize({ height: settings.height }))
			.pipe(rename({ suffix: settings.suffix }))
			.pipe(gulp.dest(path => path.base));
	});
}