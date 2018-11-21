import File from 'vinyl';

import { FileStreamTransformer } from '.';
import { PrintersBusiness } from '../entities/PrintersBusiness';

export function parseAnnotations(
  stringToEntityFn: (annotation: string) => PrintersBusiness,
): FileStreamTransformer {
  return async (mappedAnnotationsFile, _, callback) => {
    const json = JSON.parse(mappedAnnotationsFile.contents.toString()) as string[];
    const entities = json.map(str => stringToEntityFn(str));

    const annotationsCsvFile = new File({
      path: 'transcribed.csv',
      contents: new Buffer(entities.map(e => e.toCsv()).join('\n')),
    });

    callback(null, annotationsCsvFile);
  };
}
