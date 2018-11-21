import { expect } from 'chai';

import { blockReducer, symbolReducer, wordReducer } from './annotation-mapper';

const commonProperties = {
  confidence: 1,
  property: {
    detectedBreak: {
      isPrefix: false,
      type: '',
    },
    detectedLanguages: [],
  },
  boundingBox: {
    normalizedVertices: [],
    vertices: [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }],
  },
};

const symbol = (text, breakType = '') =>
  Object.assign({}, commonProperties, {
    confidence: 1,
    property: {
      detectedBreak: {
        type: breakType,
      },
    },
    text,
  });

const word = ({
  top = 0,
  bottom = 0,
  symbols = [symbol('f'), symbol('o'), symbol('o'), symbol('b'), symbol('a'), symbol('r')],
}) =>
  Object.assign({}, commonProperties, {
    boundingBox: {
      normalizedVertices: [],
      vertices: [{ x: 0, y: top }, { x: 0, y: top }, { x: 0, y: bottom }, { x: 0, y: bottom }],
    },
    symbols,
  });

const paragraph = ({ words = [word({ top: 0, bottom: 0 })] }) =>
  Object.assign({}, commonProperties, {
    words,
  });

const block = ({ paragraphs = [paragraph({})] }) =>
  Object.assign({}, commonProperties, {
    paragraphs,
  });

describe('anotation mapper', () => {
  describe('block reducer', () => {
    it('should hoist all words in to a single array', () => {
      const blocks = [
        block({}),
        block({
          paragraphs: [
            paragraph({
              words: [
                word({
                  symbols: [
                    symbol('f'),
                    symbol('u'),
                    symbol('z'),
                    symbol('z'),
                    symbol('b'),
                    symbol('i'),
                    symbol('z'),
                    symbol('z'),
                  ],
                }),
              ],
            }),
          ],
        }),
      ];

      const actual = blocks.reduce(blockReducer(), []);

      expect(actual).to.eql([
        word({}),
        word({
          symbols: [
            symbol('f'),
            symbol('u'),
            symbol('z'),
            symbol('z'),
            symbol('b'),
            symbol('i'),
            symbol('z'),
            symbol('z'),
          ],
        }),
      ]);
    });
  });

  describe('symbol reducer', () => {
    it('should join letters together to create a word', () => {
      const word = [
        symbol('f'),
        symbol('o'),
        symbol('o', 'SPACE'),
        symbol('b'),
        symbol('a'),
        symbol('r'),
      ];

      const actual = word.reduce(symbolReducer(), '');

      expect(actual).to.eql('foo bar');
    });

    it('should handle missing letter text', () => {
      const word = [
        symbol('f'),
        symbol(null),
        symbol(null, 'SPACE'),
        symbol('b'),
        symbol('a'),
        symbol('r'),
      ];

      const actual = word.reduce(symbolReducer(), '');

      expect(actual).to.eql('f bar');
    });

    it('should add trailing spaces', () => {
      const word = [
        symbol('f'),
        symbol('o'),
        symbol('o', 'EOL_SURE_SPACE'),
        symbol('b'),
        symbol('a'),
        symbol('r', 'LINE_BREAK'),
      ];

      const actual = word.reduce(symbolReducer(), '');

      expect(actual).to.eql('foo\nbar\n');
    });
  });

  describe('word reducer', () => {
    it('should join words together', () => {
      const words = [word({}), word({}), word({})];

      const mockSymbolReducer = a => 'foobar+';

      const actual = words.reduce(wordReducer(mockSymbolReducer, 0), []);

      expect(actual).to.eql(['foobar+foobar+foobar+']);
    });

    it('should determine if a word part of a new paragraph', () => {
      const words = [
        word({ top: 0, bottom: 8 }),
        word({ top: 2, bottom: 10 }),
        word({ top: 21, bottom: 29 }),
        word({ top: 23, bottom: 32 }),
      ];

      const mockSymbolReducer = a => 'foobar+';
      const synthesizedLineHeight = 8;

      const actual = words.reduce(wordReducer(mockSymbolReducer, synthesizedLineHeight), []);

      expect(actual).to.eql(['foobar+foobar+', 'foobar+foobar+']);
    });
  });
});
