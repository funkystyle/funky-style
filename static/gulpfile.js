var gulp = require("gulp"),
    ngAnnotate = require('gulp-ng-annotate'),
    minifyCSS = require("gulp-clean-css"),
    minifyJs = require("gulp-uglify"),
    htmlmin = require('gulp-htmlmin'),
    concat = require("gulp-concat"),
    imagemin = require('gulp-imagemin'),
    stripDebug = require('gulp-strip-debug'),
    stripCssComments = require('gulp-strip-css-comments'),
    removeHtmlComments = require('gulp-remove-html-comments');

// ---- Minify html files ----
gulp.task('minify_html', function() {
    gulp.src(['development/customer-panel/modules/*/*.html'])
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(removeHtmlComments())
        .pipe(gulp.dest('app/customer-panel/modules'));

    gulp.src(['development/customer-panel/*html'])
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(removeHtmlComments())
        .pipe(gulp.dest('app/customer-panel'));
});


// ---- Minify CSS files ----
gulp.task("minify_css", function() {
    // minifying css files using "gulp-clean-css"
    gulp.src(['development/customer-panel/modules/*/*/*.css', 'development/customer-panel/modules/*/*.css'])
        .pipe(stripCssComments())
        .pipe(minifyCSS({ compatibility: 'ie8' }))
        .pipe(gulp.dest('app/customer-panel/modules'));
});

gulp.task("combineCss", function () {
    console.log("Minifying CSS called");
    gulp.src('bower_components/bootstrap/dist/css/bootstrap.css')
        .pipe(stripCssComments())
        .pipe(minifyCSS({ compatibility: 'ie8' }))
        .pipe(concat('minified_boot.min.css'))
        .pipe(gulp.dest('bower_components/bootstrap/dist/css/'));

    gulp.src([
        'development/customer-panel/modules/assets/css/style.css',
        'development/customer-panel/modules/footer/footer.css',
        'development/customer-panel/modules/header/header.css',
        'development/customer-panel/modules/category.info/coupon.popup.css'
    ])
        .pipe(stripCssComments())
        .pipe(minifyCSS({ compatibility: 'ie8' }))
        .pipe(concat('global_minified.css'))
        .pipe(gulp.dest('app/customer-panel/modules'));
});

// minifying JS files
gulp.task('minify_js', function() {
    console.log("-----------Mifiying JS files-----------", new Date());
    gulp.src(['development/customer-panel/modules/*/*.js', 'development/customer-panel/modules/*.js'])
        .pipe(ngAnnotate())
        // .pipe(stripDebug())
        .pipe(minifyJs())
        .pipe(gulp.dest('app/customer-panel/modules'));
    // Minify Bower components and concatinate bower files into one file
    gulp.src([
        'bower_components/jquery/dist/jquery.min.js', 'bower_components/bootstrap/dist/js/bootstrap.min.js',
        'bower_components/angular/angular.min.js', 'bower_components/angular-sanitize/angular-sanitize.min.js',
        'bower_components/angular-ui-router/release/angular-ui-router.min.js', 'bower_components/oclazyload/dist/ocLazyLoad.min.js',
        'app/customer-panel/modules/app.js'])
        .pipe(concat('bower_scripts.js'))
        // .pipe(stripDebug())
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
        gulp.run('combineCss');
    });
});

gulp.task("default", ['watch', "minify_html", "minify_css", "minify_js", "combineCss"]);