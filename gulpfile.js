const gulp  = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const merge = require('merge-stream');
const clean = require('gulp-clean');
const cssnano = require('gulp-cssnano');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const zip = require('gulp-zip');

gulp.task('sass', function(){
  const onError = function(err) {
    notify.onError({
      title: "Gulp",
      subtitle: "Failure!",
      message: "Error: <%= error.message %>",
      sound: "Beep"
    })(err);
    this.emit('end');
  };

  return gulp.src('./app/sass/main.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sass({ outputStyle: 'nested' }))
    .pipe(concat('style.css'))
    .pipe(gulp.dest('./app/css'))
});

// Clean Build Directory
gulp.task('cleanBuild',function(){
  return gulp.src('dist/**/*', {read: false})
  .pipe(clean());
});

// Deploy to Build Directory
gulp.task('deploy', gulp.series(['cleanBuild']), function(){
 
  const cssOptimize = gulp.src('app/css/*.css')
    .pipe(cssnano())
    .pipe(gulp.dest('dist/css/'));

  const jsOptimize = gulp.src('app/js/*.js')
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));

  const imgOptimize = gulp.src('app/images/*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'))

  const htmlOptimize = gulp.src('app/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));

  return merge(cssOptimize, jsOptimize, imgOptimize, htmlOptimiz); 
});

// Deploy to Zip file
gulp.task('deployZip', gulp.series(['deploy']),function() {
    const zipNow = gulp.src('dist/**')
    .pipe(zip('deploy.zip'))
    .pipe(gulp.dest('dist'));
});

// Default Task. Local webserver dan sinkronisasi dengan browser. 
gulp.task('default', function(){
  browserSync.init({
    server: {
      baseDir: "./app"
    }
  });
  
  gulp.watch('./app/sass/**/*.scss', gulp.series(['sass']));
  gulp.watch('./app/**/*').on('change', reload);
});