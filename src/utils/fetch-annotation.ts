import { ImageAnnotatorClient } from '@google-cloud/vision';

export function fetchImageAnnotation(c: ImageAnnotatorClient) {
  return async (imagePath: string): Promise<BatchAnnotateImageResponse> => {
    return await new c().documentTextDetection(imagePath);
  };
}

export interface Vertex {
  x: number;
  y: number;
}

interface BoundingPoly {
  normalizedVertices: any[];
  vertices: [Vertex, Vertex, Vertex, Vertex];
}

interface AnnotationCommonFields {
  confidence: number;
  property: {
    detectedBreak: {
      isPrefix: boolean;
      type: '' | 'UNKNOWN' | 'SPACE' | 'SURE_SPACE' | 'EOL_SURE_SPACE' | 'HYPHEN' | 'LINE_BREAK';
    };
    detectedLanguages: Array<{
      confidence: number;
      languageCode: string;
    }>;
  };
}

export interface EntityCommonFields extends AnnotationCommonFields {
  boundingBox: BoundingPoly;
}

export interface Symbol extends EntityCommonFields {
  text: string;
}

export interface Word extends EntityCommonFields {
  symbols: Symbol[];
}

export interface Paragraph extends EntityCommonFields {
  words: Word[];
}

export interface Block extends EntityCommonFields {
  blockType: 'UNKNOWN' | 'TEXT' | 'TABLE' | 'PICTURE' | 'RULER' | 'BARCODE';
  paragraphs: Paragraph[];
}

interface Page extends AnnotationCommonFields {
  blocks: Block[];
  height: number;
  width: number;
}

export type BatchAnnotateImageResponse = Array<{
  faceAnnotations: any[];
  landmarkAnnotations: any[];
  logoAnnotations: any[];
  labelAnnotations: any[];
  localizedObjectAnnotations: any[];
  textAnnotations: Array<{
    locations: any[];
    properties: any[];
    mid: string;
    locale: string;
    description: string;
    score: number;
    confidence: number;
    topicality: number;
    boundingPoly: BoundingPoly;
  }>;
  fullTextAnnotation: {
    pages: Page[];
    text: string;
  };
  safeSearchAnnotation: any;
  imagePropertiesAnnotation: any;
  cropHintsAnnotation: any;
  webDetection: any;
  error: Error;
  context: any;
}>;
