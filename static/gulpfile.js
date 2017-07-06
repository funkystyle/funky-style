var gulp = require("gulp"),
    ngAnnotate = require('gulp-ng-annotate'),
    minifyCSS = require("gulp-clean-css"),
    minifyJs = require("gulp-uglify"),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin');

// ---- Minify html files ----
gulp.task('minify_html', function() {
    gulp.src(['development/customer-panel/modules/*/*.html'])
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('app/customer-panel/modules'));

    gulp.src(['development/customer-panel/*html'])
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('app/customer-panel'));
});


// ---- Minify CSS files ----
gulp.task("minify_css", function() {
    // minifying css files using "gulp-clean-css"
    gulp.src(['development/customer-panel/modules/*/*/*.css', 'development/customer-panel/modules/*/*.css'])
        .pipe(minifyCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest('app/customer-panel/modules'));
});
// minifying JS files
gulp.task('minify_js', function() {
    gulp.src(['development/customer-panel/modules/*/*.js', 'development/customer-panel/modules/*.js'])
        .pipe(ngAnnotate())
        .pipe(minifyJs())
        .pipe(gulp.dest('app/customer-panel/modules'));
});

// watching static files
gulp.task('watch', function() {
    // watching HTML files and then minifying
    gulp.watch(['development/customer-panel/modules/*/*.html', 'development/customer-panel/*html'], function() {
        gulp.run("minify_html");
    });

    // watching JS files and then minifying
    gulp.watch(['development/customer-panel/modules/*/*.js', 'development/customer-panel/modules/*.js'], function() {
        gulp.run("minify_js");
    });

    // watching CSS files and then minifying
    gulp.watch(['development/customer-panel/modules/*/*/*.css', 'development/customer-panel/modules/*/*.css'], function() {
        gulp.run("minify_css");
    });
});

gulp.task("default", ['watch', "minify_html", "minify_css", "minify_js"]);