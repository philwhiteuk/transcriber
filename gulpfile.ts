import { dest, series, src } from 'gulp';
import concat from 'gulp-concat';
import through2 from 'through2';

import { stringToEntity } from './src/entities/PrintersBusiness';
import { annotateImages, mapAnnotations, parseAnnotations } from './src/transformers';
import {
  annotationMapper,
  blockReducer,
  symbolReducer,
  wordReducer,
} from './src/utils/annotation-mapper';
import { fetchAnnotation } from './src/utils/fetch-annotation';

function process() {
  return src('./workspace/images/*.jpg')
    .pipe(through2.obj(annotateImages(fetchAnnotation())))
    .pipe(dest('./workspace/annotations'));
}

function transform() {
  return src(['./workspace/annotations/*.orig.json'])
    .pipe(through2.obj(mapAnnotations(annotationMapper(blockReducer, wordReducer, symbolReducer))))
    .pipe(dest('./workspace/annotations'));
}

function output() {
  return src('./workspace/annotations/*.mapped.json')
    .pipe(through2.obj(parseAnnotations(stringToEntity)))
    .pipe(concat('upload.csv'))
    .pipe(dest('./workspace'));
}

module.exports = {
  default: series(transform, output),
  process,
  transform,
  output,
};
