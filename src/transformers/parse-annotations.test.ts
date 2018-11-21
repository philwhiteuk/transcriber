import { expect } from 'chai';
import File from 'vinyl';

import { PrintersBusiness } from '../entities/PrintersBusiness';
import { parseAnnotations } from './parse-annotations';

describe('transformers: annotations parser', () => {
  it('should parse annotations to csv', async () => {
    let mapperArgs;
    let transformerArgs;
    const transformerFn = parseAnnotations((...args) => {
      mapperArgs = args;
      return new PrintersBusiness('directory entry string');
    });

    const mockAnnotationFile = new File({
      path: '/q/z/f/g.json',
      contents: Buffer.from(JSON.stringify(['any business'])),
    });

    await transformerFn(mockAnnotationFile, 'UTF8', (...args) => {
      transformerArgs = args;
    });

    expect(mapperArgs).to.have.lengthOf(1);
    expect(transformerArgs[0]).to.be.null;
    expect(transformerArgs[1]).to.be.instanceof(File);
    expect(transformerArgs[1].path).to.eql('transcribed.csv');
    expect(transformerArgs[1].contents.toString()).to.eql(
      '"directory entry string","directory entry string","","","","","","",""',
    );
  });
});
