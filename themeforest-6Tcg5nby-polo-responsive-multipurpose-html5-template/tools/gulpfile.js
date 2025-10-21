// node.js Packages / Dependencies
const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const gulpif = require('gulp-if');
//const merge = require('merge-stream');
const npmDist = require('gulp-npm-dist');


//settings
var compile = {
    jsMinify: true,
    cssMinify: true,
    jsSourcemaps: false,
    cssSourcemaps: true,
};

//var ;
var directory = {
    resources: './src',
    dist: '../',
    livePath: '../Template',
    distPath: '../Template',
    node_modules: 'node_modules',
}

var bootstrap = {
    js: directory.node_modules + '/bootstrap/js/',
    css: directory.node_modules + '/bootstrap/css/'
}

var file = {
    scss: 'style.scss',
    functions: 'functions.js',
    plugins: 'plugins.scss'
}

// Paths
var paths = {
    dist: {
        base: directory.dist,
        html: directory.dist,
        css: directory.distPath + '/css',
        scss: directory.dist + '/scss',
        js: directory.dist + '/js',
        plugins: directory.dist + '/plugins',
        images: directory.dist + '/images',
        webfonts: directory.dist + '/webfonts', 
    },
    src: {
        base: directory.resources,
        html: directory.resources + '/**/*.html',
        css: directory.resources + '/css',
        scss: directory.resources + '/scss',
        js: directory.resources + '/js',
        images: directory.resources + '/images/**/*.+(png|jpg|gif|svg)',
        plugins: directory.resources + '/scss',
        webfonts: directory.resources + '/webfonts/*'
    }
}

// Vendor
var plugins = {
    bootstrap: {
        alert: bootstrap.js + "alert.js", 
        baseComponent: bootstrap.js + "base-component.js",
        button: bootstrap.js + "button.js",
        carousel: bootstrap.js + "carousel.js",
        collapse: bootstrap.js + "collapse.js",
        dropdown: bootstrap.js + "dropdown.js",
        modal: bootstrap.js + "modal.js",
        popover: bootstrap.js + "popover.js",
        scrollspy: bootstrap.js + "scrollspy.js",
        tab: bootstrap.js + "tab.js",
        toast: bootstrap.js + "toast.js",
        tooltip: bootstrap.js + "tooltip.js",
    },
    /* 	plugins: {
    		alert: bootstrap.js + "alert.js",
    		baseComponent: bootstrap.js + "base-component.js"
    	},
    	core: {
    		alert: bootstrap.js + "alert.js",
    		baseComponent: bootstrap.js + "base-component.js"
    	}, */
}

// Compile SCSS
gulp.task('scss', () => {
    return gulp.src(paths.src.scss + '/' + file.scss)
        .pipe(gulpif(compile.cssSourcemaps, sourcemaps.init()))
        .pipe(
            sass({
                outputStyle: 'compact',
            }).on('error', sass.logError),
        )
        .pipe(autoprefixer())
        .pipe(gulpif(compile.cssSourcemaps, sourcemaps.write('./')))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// Compile plugins SCSS
gulp.task('plugins', () => {
    return gulp.src(paths.src.scss + '/' + file.plugins)
        .pipe(gulpif(compile.cssSourcemaps, sourcemaps.init()))
        .pipe(
            sass({
                outputStyle: 'compressed',
            }).on('error', sass.logError),
        )
        .pipe(autoprefixer())
        .pipe(gulpif(compile.cssSourcemaps, sourcemaps.write('./')))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// Compile css
gulp.task('compile:css', gulp.series('scss', 'plugins'));


// Minify CSS
gulp.task('minify:css', () => {
    return gulp.src(paths.dist.css + '/**/!(*.min)*.css')
        .pipe(gulpif(compile.cssMinify,
            cleanCSS({ compatibility: 'ie11', }),
        ))
        .pipe(gulpif(compile.cssMinify,
            rename({ suffix: '.min', }),
        ))
        .pipe(gulp.dest(paths.dist.css));
});


// Compile JS
gulp.task('js', () => {
    return gulp
        .src(paths.src.js + '/**/*.js')
        .pipe(gulpif(compile.jsSourcemaps, sourcemaps.init()))
        .pipe(
            babel({
                presets: ['@babel/preset-env'],
            }),
        )
        //.pipe(concat('functions.js'))
        .pipe(gulpif(compile.jsSourcemaps, sourcemaps.write('./')))
        .pipe(gulp.dest(paths.dist.js))

    //chkd
    .pipe(browserSync.stream());
});

// Minify JS
gulp.task('minify:js', () => {
    return gulp.src(paths.dist.js + '/**/!(*.min)*.js')
        .pipe(gulpif(compile.jsMinify, uglify()))
        .pipe(gulpif(compile.jsMinify, rename({ suffix: '.min' })))
        .pipe(gulp.dest(paths.dist.js))
});

// Copy dependencies to ./public/libs/
gulp.task('copy:libs', function() {
    gulp.src(
            npmDist({
                copyUnminified: true,
                excludes: [
                    '/**/*.json',
                    '/**/*.txt',
                    '/**/*.zip',
                    '/**/*.sass',
                    '/**/*.html',
                    'source/**/*',
                    'locale/**/*',
                    '/**/*.nupkg',
                    'lib/**/*',
                    'nuget/**/*',
                    '/**/*nuspec'
                ]
            }), {
                base: './node_modules'
            })
        .pipe(rename(function(path) {
            path.dirname = path.dirname.replace(/\/dist/, '').replace(/\\dist/, '').replace(/\/build/, '').replace(/\\build/, '').replace(/\/min/, '').replace(/\\min/, '').replace(/\/media/, '').replace(/\\media/, '').replace(/\/scripts/, '').replace(/\\scripts/, '');
        }))
        .pipe(gulp.dest(paths.dist.plugins));
});

// Copy plugins
gulp.task('npm:plugins', () => {
    return gulp.src(npmDist({
            copyUnminified: true,
            excludes: [
                '/**/*.json',
                '/**/*.txt',
                '/**/*.zip',
                '/**/*.sass',
                '/**/*.html',
                'source/**/*',
                'locale/**/*',
                '/**/*.nupkg',
                'lib/**/*',
                'nuget/**/*',
                '/**/*nuspec'
            ]
        }), { base: paths.node_modules })
        //	.pipe(rename(function(path) {
        //		path.dirname = path.dirname.replace(/\/dist/, '').replace(/\\dist/, '').replace(/\/build/, '').replace(/\\build/, '').replace(/\/min/, '').replace(/\\min/, '').replace(/\/media/, '').replace(/\\media/, '').replace(/\/scripts/, '').replace(/\\scripts/, '');
        //	}))
        .pipe(gulp.dest(paths.dist.plugins));
});

//Copy plugins css customizations
gulp.task('src:plugins', () => {
    return gulp.src(paths.src.plugins + '/**/*')
        .pipe(gulp.dest(paths.dist.plugins));
});

gulp.task('copy:plugins', gulp.series(
    'npm:plugins',
    //'src:plugins'
));


// // Compress (JPEG, PNG, GIF, SVG, JPG)
// gulp.task('compress:images', () => {
// 	return gulp
// 		.src(paths.src.images)
// 		.pipe(
// 			imagemin([
// 				imagemin.gifsicle({
// 					interlaced: true
// 				}),
// 				imagemin.mozjpeg({
// 					quality: 75,
// 					progressive: true
// 				}),
// 				imagemin.optipng({
// 					optimizationLevel: 5
// 				}),
// 				imagemin.svgo({
// 					plugins: [{
// 						removeViewBox: true
// 					}, {
// 						cleanupIDs: false
// 					}],
// 				}),
// 			]),
// 		)
// 		.pipe(gulp.gulp.dest(paths.dist.images));
// });


// Copy HTML files
gulp.task('copy:html', () => {
    return gulp.src([
            paths.src.html,
            paths.src.html + '/pages/**/*'
        ])
        .pipe(gulp.dest(paths.dist.html))
});


// Copy images
gulp.task('copy:images', () => {
    return gulp.src(paths.src.images)
        .pipe(gulp.dest(paths.dist.images))
});

// Copy webfonts
gulp.task('copy:webfonts', () => {
    return gulp.src(paths.src.webfonts)
        .pipe(gulp.dest(paths.dist.webfonts))
});


// Clean dist
gulp.task('clean', function() {
    return gulp.src(paths.dist.base).pipe(clean({ force: true }));
});

// Build (Prepare all assets for production)
gulp.task('build', gulp.series(
    'scss',
    //'minify:css', 
    'js',
    //'minify:js',
    //'copy:plugins',
    //'copy:images',
    //'copy:html',
    //'copy:webfonts'
    //'minify:plugins'
));



// Watch (SASS, CSS, JS, and HTML) reload browser on change
gulp.task('watch', () => {
     browserSync.init({
    	server: {
    		baseDir: directory.livePath,
    	},
    });
    //gulp.watch(paths.src.scss, gulp.series('minify:css'));
    gulp.watch(paths.src.scss, gulp.series('scss')); 
    gulp.watch(paths.src.scss, gulp.series('plugins'));
    //	gulp.watch(paths.src.css, gulp.series('scss'));
    //	gulp.watch(paths.src.js, gulp.series('js'));

    gulp.watch(paths.dist.html).on('change', browserSync.reload);
});