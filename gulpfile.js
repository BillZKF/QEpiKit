var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var connect = require('gulp-connect');
var Server = require('karma').Server;
var rollup = require('rollup').rollup;


/**
 * Do karma
 */
gulp.task('test', function(done) {
    new Server({
        configFile: __dirname + '/karma.conf.js'
    }, done).start();
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function(done) {
    gulp.watch(['dist/*.js', 'tests/*.js', 'demos/*'], ['scripts', 'minify', 'test']);
});

gulp.task('minify', function() {
    return gulp.src('qepikit.js')
        .pipe(rename('qepikit.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./'));
})
// Concatenate & Minify JS
gulp.task('scripts', function() {
    return rollup({
        entry: 'dist/QEpiKit.js'

    }).then(function(bundle) {
        return bundle.write({
            format: 'cjs',
            sourceMap: 'inline',
            dest: 'qepikit.js'
        });
    });

});

gulp.task('server', function() {
    connect.server({
        livereload: true
    });
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch(['dist/*.js', 'tests/*.js', 'demos/*'], ['scripts']);
});

gulp.task('default', ['server', 'tdd']);
