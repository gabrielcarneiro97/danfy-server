const gulp = require('gulp');
const ts = require('gulp-typescript');

const tsProject = ts.createProject('tsconfig.json');

const files = [
  '**/*.json',
  '**/*.pem',
  '!node_modules/**',
  '!dist/**',
  '!tsconfig.json',
];

gulp.task('copy-files', () => gulp.src(files)
  .pipe(gulp.dest('dist')));


gulp.task('tsc', () => tsProject.src()
  .pipe(tsProject())
  .js.pipe(gulp.dest('dist')));

gulp.task('default', gulp.series(gulp.parallel('copy-files'), gulp.parallel('tsc')));
