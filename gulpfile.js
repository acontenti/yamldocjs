const gulp = require('gulp');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

function build() {
	gulp.src(['src/*.js'])
		.pipe(rename({basename: 'yamldoc'}))
		.pipe(gulp.dest('./dist'));
	return gulp.src(['src/*.js'])
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(rename({basename: 'yamldoc', suffix: '.min'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('./dist'));
}

exports.default = build;