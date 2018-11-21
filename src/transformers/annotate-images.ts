import File from 'vinyl';

import { FileStreamTransformer } from '.';
import { BatchAnnotateImageResponse } from '../utils/fetch-annotation';

export function annotateImages(
  imageAnnotationFetcher: (filepath: string) => Promise<BatchAnnotateImageResponse>,
): FileStreamTransformer {
  return async (imageFile, _, callback) => {
    const annotation = await imageAnnotationFetcher(imageFile.path);
    const transformedFile = new File({
      path: imageFile.basename.replace(/jpg$/, 'orig.json'),
      contents: new Buffer(JSON.stringify(annotation)),
    });

    callback(null, transformedFile);
  };
}
