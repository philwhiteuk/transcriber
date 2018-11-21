import File from 'vinyl';

import { annotateImages } from './annotate-images';
import { mapAnnotations } from './map-annotations';
import { parseAnnotations } from './parse-annotations';

type TransformerCallbackFn = (error: Error, file: File) => void;

export type FileStreamTransformer = (
  file: File,
  encoding: string,
  callback: TransformerCallbackFn,
) => Promise<void>;

export { annotateImages, mapAnnotations, parseAnnotations };
