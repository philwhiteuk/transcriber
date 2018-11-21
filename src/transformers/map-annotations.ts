import File from 'vinyl';

import { FileStreamTransformer } from '.';
import { BatchAnnotateImageResponse } from '../utils/fetch-annotation';

export function mapAnnotations(
  annotationMapper: (annotation: BatchAnnotateImageResponse) => string[],
): FileStreamTransformer {
  return async (originalAnnotationFile, _, callback) => {
    const json = JSON.parse(originalAnnotationFile.contents.toString());
    const mappedJson = annotationMapper(json);

    if (!(mappedJson instanceof Array)) {
      throw new Error('annotation mapping failed');
    }

    const mappedAnnotationFile = new File({
      path: originalAnnotationFile.basename.replace(/\.json$/, '.mapped.json'),
      contents: new Buffer(JSON.stringify(mappedJson)),
    });

    callback(null, mappedAnnotationFile);
  };
}
