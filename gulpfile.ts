import { dest, series, src } from 'gulp';
import concat from 'gulp-concat';
import through2 from 'through2';
import { annotateImageFile, mapImageAnnotation, parseImageAnnotation } from './src/batch-methods';

function process() {
  return src('./workspace/upload/*.jpg')
    .pipe(through2.obj(annotateImageFile))
    .pipe(dest('./workspace/annotations'));
}

function transform() {
  return src(['./workspace/annotations/*.json', '!./workspace/annotations/*.mapped.json'])
    .pipe(through2.obj(mapImageAnnotation))
    .pipe(dest('./workspace/annotations'));
}

function output() {
  return src('./workspace/annotations/*.mapped.json')
    .pipe(through2.obj(parseImageAnnotation))
    .pipe(concat('transcription.csv'))
    .pipe(dest('./workspace'));
}

module.exports = {
  default: series(transform, output),
  process,
  transform,
  output,
};
