import { expect } from 'chai';

import { PrintersBusiness } from './PrintersBusiness';

const exampleRawString =
  'A.B. Usiness & Sons\n' +
  '123 Anywhere Street, E2 3CW.\n' +
  'Tel: 00000-000-000\n' +
  'Fax: 00000-000-000\n' +
  'ABIJRS 1-99\n' +
  'SERVICES AVAILABLE: some \n' +
  'details about the services\n' +
  'rendered';

describe('"printers business" entity', () => {
  it('should have a name', () => {
    const actual = new PrintersBusiness(exampleRawString);
    expect(actual.name).to.equal('A.B. Usiness & Sons');
  });

  it('should have an address', () => {
    const actual = new PrintersBusiness(exampleRawString);
    expect(actual.address).to.equal('123 Anywhere Street, E2 3CW.');
  });

  it('should have an postcode', () => {
    const actual = new PrintersBusiness(exampleRawString);
    expect(actual.postcode).to.equal('E2 3CW');
  });

  it('should have a trade code', () => {
    const actual = new PrintersBusiness(exampleRawString);
    expect(actual.trade_code).to.equal('ABIJRS');
  });

  it('should have a range of employee numbers', () => {
    const actual = new PrintersBusiness(exampleRawString);
    expect(actual.employees).to.equal('1-99');
  });

  it('should return a list of processes, services and work rendered', () => {
    const actual = new PrintersBusiness(exampleRawString);

    expect(actual.processes_employed).to.equal(
      'Lithography (Small Offset), Lithography (Sheet Fed)',
    );
    expect(actual.services_available).to.equal('Die Stamping, Duplicate Platemaking');
    expect(actual.work_undertaken).to.equal('Business Forms, Cartons');
  });

  it('should return a comma-separated list of the business info', () => {
    const actual = new PrintersBusiness(exampleRawString);

    expect(actual.toCsv()).to.eql(
      '"A.B. Usiness & Sons\n123 Anywhere Street, E2 3CW.\nTel: 00000-000-000\nFax: 00000-000-000\nABIJRS 1-99\nSERVICES AVAILABLE: some \ndetails about the services\nrendered","A.B. Usiness & Sons","E2 3CW","123 Anywhere Street, E2 3CW.","1-99","ABIJRS","Lithography (Small Offset), Lithography (Sheet Fed)","Die Stamping, Duplicate Platemaking","Business Forms, Cartons"',
    );
  });

  it('should return the csv headers', () => {
    const actual = PrintersBusiness.csvHeaders();

    expect(actual).to.eql(
      '"Raw String","Name","Postcode","Address","No. Employees","Trade Code","Processes Employed","Services Available","Work Undertaken"',
    );
  });
});
