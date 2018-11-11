import { dest, series, src } from 'gulp';
import concat from 'gulp-concat';
import through2 from 'through2';
import File from 'vinyl';

import { PrintersBusiness } from './src/entities/printers';
import { remapAnnotation } from './src/image-processing';
import { annotateImage } from './src/utils/annotate-image';

function process() {
  return src('./workspace/upload/*.jpg')
    .pipe(
      through2.obj(async (imageFile: File, _, cb) => {
        const json = await annotateImage(imageFile.path);
        const file = new File({
          path: imageFile.basename.replace(/jpg$/, 'json'),
          contents: new Buffer(JSON.stringify(json)),
        });

        cb(null, file);
      }),
    )
    .pipe(dest('./workspace/annotations'));
}

function transform() {
  return src(['./workspace/annotations/*.json', '!./workspace/annotations/*.mapped.json'])
    .pipe(
      through2.obj((annotationFile: File, _, cb) => {
        const json = JSON.parse(annotationFile.contents.toString());
        const mappedJson = remapAnnotation(json);
        const file = new File({
          path: annotationFile.basename.replace(/\.json$/, '.mapped.json'),
          contents: new Buffer(JSON.stringify(mappedJson)),
        });

        cb(null, file);
      }),
    )
    .pipe(dest('./workspace/annotations'));
}

function output() {
  return src('./workspace/annotations/*.mapped.json')
    .pipe(
      through2.obj((annotationFile: File, _, cb) => {
        const json = JSON.parse(annotationFile.contents.toString());
        const csvMap = json.map(annotation => new PrintersBusiness(annotation)).map(o => o.toCsv());
        const file = new File({
          path: 'transcription.csv',
          contents: new Buffer(csvMap.join('')),
        });

        cb(null, file);
      }),
    )
    .pipe(concat('transcription.csv'))
    .pipe(dest('./workspace'));
}

module.exports = {
  default: series(transform, output),
  process,
  transform,
  output,
};
