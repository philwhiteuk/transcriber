import { expect } from 'chai';
import File from 'vinyl';

import { annotateImages } from './annotate-images';

describe('transformers: images annotator', () => {
  it('should create a json image annotation file', async () => {
    let annotationFetcherArgs;
    let callbackArgs;

    const transformerFn = annotateImages(async (...args) => {
      annotationFetcherArgs = args;
      return null;
    });

    const mockImageFile = new File({
      path: '/a/b/c/d.jpg',
    });

    await transformerFn(mockImageFile, 'UTF8', (...args) => {
      callbackArgs = args;
    });

    expect(annotationFetcherArgs).to.eql(['/a/b/c/d.jpg']);
    expect(callbackArgs[0]).to.be.null;
    expect(callbackArgs[1]).to.be.an.instanceof(File);
    expect(callbackArgs[1].path).to.eql('d.json');
  });

  it('should resolve the annotation response', async () => {
    const transformerFn = annotateImages(async (...args) => []);

    const mockImageFile = new File({
      path: '/a/b/c/d.jpg',
    });

    let output;
    await transformerFn(mockImageFile, 'UTF8', (...args) => {
      output = args[1];
    });

    expect(JSON.parse(output.contents.toString())).to.eql([]);
  });
});
