import { ImageAnnotatorClient } from '@google-cloud/vision';

export async function annotateImage(imagePath: string): Promise<BatchAnnotateImageResponse> {
  const client = new ImageAnnotatorClient();
  return await client.documentTextDetection(imagePath);
}

interface Vertex {
  x: number;
  y: number;
}

interface BoundingPoly {
  vertices: [Vertex, Vertex, Vertex, Vertex];
  normalizedVertices: any[];
}

interface AnnotationCommonFields {
  property: {
    detectedLanguages: Array<{
      languageCode: string;
      confidence: number;
    }>;
    detectedBreak: {
      type: number;
      isPrefix: boolean;
    };
  };
  confidence: number;
}

interface EntityCommonFields extends AnnotationCommonFields {
  boundingBox: BoundingPoly;
}

type BatchAnnotateImageResponse = Array<{
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
    pages: Array<
      AnnotationCommonFields & {
        width: number;
        height: number;
        blocks: Array<
          EntityCommonFields & {
            paragraphs: Array<
              EntityCommonFields & {
                words: Array<
                  EntityCommonFields & {
                    symbols: Array<
                      EntityCommonFields & {
                        text: string;
                      }
                    >;
                  }
                >;
              }
            >;
            blockType: 'UNKNOWN' | 'TEXT' | 'TABLE' | 'PICTURE' | 'RULER' | 'BARCODE';
          }
        >;
      }
    >;
    text: string;
  };
  safeSearchAnnotation: any;
  imagePropertiesAnnotation: any;
  cropHintsAnnotation: any;
  webDetection: any;
  error: Error;
  context: any;
}>;
