import File from 'vinyl';
import { formatDirectoryEntry, parseDirectoryEntry } from './directory-entry-parser';
import { annotateImage, remapAnnotation } from './image-processing';

type callbackFunction = (e: Error, f: File) => void;
type transformFunction = (f: File, encoding: string, c: callbackFunction) => Promise<void>;

export const annotateImageFile: transformFunction = async (imageFile, _, cb) => {
  const json = await annotateImage(imageFile.path);

  cb(
    null,
    new File({
      path: imageFile.basename.replace(/jpg$/, 'json'),
      contents: new Buffer(JSON.stringify(json)),
    }),
  );
};

export const mapImageAnnotation: transformFunction = async (annotationFile, _, cb) => {
  const json = remapAnnotation(JSON.parse(annotationFile.contents.toString()));

  cb(
    null,
    new File({
      path: annotationFile.basename.replace(/\.json$/, '.mapped.json'),
      contents: new Buffer(JSON.stringify(json)),
    }),
  );
};

export const parseImageAnnotation: transformFunction = async (annotationFile, _, cb) => {
  const json = JSON.parse(annotationFile.contents.toString());
  const csvMap = json.map(parseDirectoryEntry).map(formatDirectoryEntry);

  cb(
    null,
    new File({
      path: 'transcription.csv',
      contents: new Buffer(csvMap.join('')),
    }),
  );
};
