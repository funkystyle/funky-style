var gulp = require("gulp"),
    browserSync = require('browser-sync').create(),
    ngAnnotate = require('gulp-ng-annotate'),
    minifyCSS = require("gulp-clean-css"),
    minifyJs = require("gulp-uglify"),
    concat = require("gulp-concat"),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin');

// ---- Minify html files ----
gulp.task('minify_html', function() {
    gulp.src(['app/customer-panel/modules/*/*.html'])
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist/customer-panel/modules'));

    gulp.src(['app/customer-panel/*html'])
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('dist/customer-panel'));
});


// ---- Minify CSS files ----
gulp.task("minify_css", function() {
    // minifying css files using "gulp-clean-css"
    gulp.src(['app/customer-panel/modules/*/*/*.css', 'app/customer-panel/modules/*/*.css'])
        .pipe(minifyCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest('dist/customer-panel/modules'));
});
// minifying JS files
gulp.task('minify_js', function() {
    gulp.src(['app/customer-panel/modules/*/*.js', 'app/customer-panel/modules/*.js'])
        .pipe(ngAnnotate())
        .pipe(minifyJs())
        .pipe(gulp.dest('dist/customer-panel/modules'));
});

// concat bower components
gulp.task("bower", function () {

});

gulp.task('customer', []);