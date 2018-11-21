import { expect } from 'chai';
import File from 'vinyl';

import { mapAnnotations } from './map-annotations';

describe('transformers: annotations mapper', () => {
  it('should create a modified json image annotation file', async () => {
    let mapperArgs;
    let transformerArgs;
    const transformerFn = mapAnnotations((...args) => {
      mapperArgs = args;
      return [];
    });

    const mockAnnotationFile = new File({
      path: '/q/z/f/g.orig.json',
      contents: Buffer.from(JSON.stringify({ x: 'y' })),
    });

    await transformerFn(mockAnnotationFile, 'UTF8', (...args) => {
      transformerArgs = args;
    });

    expect(mapperArgs).to.have.lengthOf(1);
    expect(transformerArgs[0]).to.be.null;
    expect(transformerArgs[1]).to.be.instanceof(File);
    expect(transformerArgs[1].path).to.eql('g.mapped.json');
    expect(JSON.parse(transformerArgs[1].contents.toString())).to.eql([]);
  });
});
