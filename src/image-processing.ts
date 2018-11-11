import { ImageAnnotatorClient } from '@google-cloud/vision';

export function annotateImage(imageFilePath: string): any {
  return new ImageAnnotatorClient().documentTextDetection(imageFilePath);
}

type vertices = Array<{
  x: number;
  y: number;
}>;

function calculateVerticalExtremities(v: vertices): { top: number; bottom: number } {
  const verticals = v.map(p => p.y);
  return {
    top: verticals.slice(0, 2).reduce((a, y) => (y > a ? y : a)),
    bottom: verticals.slice(3, 4).reduce((a, y) => (y < a ? y : a)),
  };
}

export function remapAnnotation(annotation: any): Promise<string[]> {
  try {
    const annotatedPage = annotation[0].fullTextAnnotation.pages[0];
    const avgLineHeight = annotatedPage.height * 0.0094;

    const mappedBlocks = annotatedPage.blocks.map(block => {
      const blockContent = block.paragraphs.map(para => {
        const wordsArr = para.words.map(word => {
          const text = word.symbols.map(symbol => symbol.text || '').join('');
          const position = calculateVerticalExtremities(word.boundingBox.vertices);

          return {
            position,
            text,
          };
        });

        const mappedWords = wordsArr.reduce((acc, word, currIdx, arr) => {
          const prevWord = arr[currIdx - 1];

          if (currIdx == 0) {
            return word.text;
          }

          if (word.position.top > prevWord.position.bottom - avgLineHeight * 0.5) {
            return `${acc}\n${word.text}`;
          }

          if (
            word.text.search(/[.,\-:;\/)]/) !== -1 ||
            (prevWord && prevWord.text.search(/[\-\/(]/) !== -1)
          ) {
            return `${acc}${word.text}`;
          }

          return `${acc} ${word.text}`;
        }, '');
        return mappedWords;
      });

      return {
        position: calculateVerticalExtremities(block.boundingBox.vertices),
        text: blockContent,
      };
    });

    return mappedBlocks
      .reduce((acc, block, currIdx, arr) => {
        const prevBlock = arr[currIdx - 1];

        if (currIdx == 0 || block.position.top > prevBlock.position.bottom + avgLineHeight) {
          return acc.concat(block);
        }

        const oldBlock = acc.pop();
        return acc.concat({
          position: {
            top: oldBlock.position.top,
            bottom: block.position.bottom,
          },
          text: oldBlock.text.concat(block.text),
        });
      }, [])
      .map(e => e.text.join('\n'));
  } catch (err) {
    console.error(err);
  }
}
