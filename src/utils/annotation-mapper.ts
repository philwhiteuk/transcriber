import {
  BatchAnnotateImageResponse,
  Block,
  EntityCommonFields,
  Paragraph,
  Symbol,
  Vertex,
  Word,
} from './fetch-annotation';

type arrReduceCallbackFn = (
  previousValue: any,
  currentValue: any,
  currentIndex: number,
  array: any[],
) => any;

enum WordEndingTypes {
  'SPACE' = ' ',
  'SURE_SPACE' = ' ',
  'EOL_SURE_SPACE' = '\n',
  'LINE_BREAK' = '\n',
}

function bounds(e: EntityCommonFields): { top: number; bottom: number } {
  const vertices = e.boundingBox.vertices.map(p => p.y);
  return {
    top: vertices.slice(0, 2).reduce((a, y) => (y > a ? y : a)),
    bottom: vertices.slice(3, 4).reduce((a, y) => (y < a ? y : a)),
  };
}

function isNewParagraph(
  fromContext: EntityCommonFields,
  toContext: EntityCommonFields,
  avgLineHeight: number,
): boolean {
  const [previousObj, currentObj] = [bounds(fromContext), bounds(toContext)];

  return currentObj.top > previousObj.bottom + avgLineHeight * 1;
}

export function blockReducer(): arrReduceCallbackFn {
  return (previousValue: Word[], currentBlock: Block): Word[] => {
    const newWords = currentBlock.paragraphs.reduce((a, p) => a.concat(p.words), []);

    return previousValue.concat(newWords);
  };
}

export function wordReducer(
  symbolReducer: arrReduceCallbackFn,
  avgLineHeight: number,
): arrReduceCallbackFn {
  return (
    previousValue: string[],
    currentWord: Word,
    currentIndex: number,
    array: Word[],
  ): string[] => {
    let text = currentWord.symbols.reduce(symbolReducer, '');

    if (currentIndex > 0 && !isNewParagraph(array[currentIndex - 1], currentWord, avgLineHeight)) {
      const lastString = previousValue.pop();
      text = lastString.concat(text);
    }

    previousValue.push(text);
    return previousValue;
  };
}

export function symbolReducer(): arrReduceCallbackFn {
  return (previousValue: string, currentValue: Symbol): string => {
    const { text, property } = currentValue;
    const detectedBreak = property ? property.detectedBreak : null;
    const breakType =
      detectedBreak && WordEndingTypes[detectedBreak.type]
        ? WordEndingTypes[detectedBreak.type]
        : '';

    return previousValue.concat(text || '', breakType);
  };
}

export function annotationMapper(
  blockReducer: () => arrReduceCallbackFn,
  wordReducer: (symbolReducer: arrReduceCallbackFn, avgLineHeight: number) => arrReduceCallbackFn,
  symbolReducer: () => arrReduceCallbackFn,
): (annotation: BatchAnnotateImageResponse) => string[] {
  return (annotation: BatchAnnotateImageResponse): string[] => {
    const annotatedPage = annotation[0].fullTextAnnotation.pages[0];
    const words: Word[] = annotatedPage.blocks.reduce(blockReducer(), []);

    return words.reduce(wordReducer(symbolReducer(), annotatedPage.height * 0.0094), []);
  };
}
