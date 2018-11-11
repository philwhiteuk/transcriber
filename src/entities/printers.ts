import { format } from 'util';

enum PrintersTradeServiceCodes {
  A = 'Lithography (Small Offset)',
  B = 'Lithography (Sheet Fed)',
  C = 'Lithography (Web Offset)',
  D = 'Flexography',
  E = 'Gravure',
  F = 'Letterpress (Rotary)',
  G = 'Letterpress (Flatbed)',

  H = 'Books',
  I = 'Business Forms',
  J = 'Cartons',
  K = 'Commercial',
  L = 'Direct Mail',
  M = 'Labels',
  N = 'Newspapers',
  O = 'Periodicals',
  P = 'Posters',

  Q = 'Bookbinding and Print Finishing',
  R = 'Die Stamping',
  S = 'Duplicate Platemaking',
  T = 'In-house Printing',
  U = 'Paper Converting',
  V = 'Phototypesetting',
  W = 'Process Engraving',
  X = 'Thermography',
}

const ukPostcodeRegex = /([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})/;
const tradeCodeRegex = /\n([A-X]+) ([^\n]*)\n/;
const addressRegex = /^[^\n]*\n(.*)\nTel/s;

export class PrintersBusiness {
  constructor(private rawString: string) {}

  get name(): string {
    return this.rawString.split(/\n/)[0];
  }

  get address(): { full: string; postcode: string } {
    const address = this.rawString.match(addressRegex);
    const postcode = this.rawString.match(ukPostcodeRegex);
    return {
      full: address ? address[1].replace(/\n/, ' ') : '',
      postcode: postcode ? postcode[0] : '',
    };
  }

  get trade_code(): string {
    const code = this.rawString.match(tradeCodeRegex);
    return code ? code[1] : '';
  }

  get employees(): string {
    const code = this.rawString.match(tradeCodeRegex);
    return code ? code[2] : '';
  }

  get processes_employed(): string {
    return this.mapBusinessCodes(this.trade_code.match(/[A-G]/g) || []);
  }

  get work_undertaken(): string {
    return this.mapBusinessCodes(this.trade_code.match(/[H-P]/g) || []);
  }

  get services_available(): string {
    return this.mapBusinessCodes(this.trade_code.match(/[Q-X]/g) || []);
  }

  public toCsv(): string {
    return format(
      '"%s","%s","%s","%s","%s","%s","%s","%s"\n',
      this.rawString,
      this.name,
      this.address.postcode,
      this.address.full,
      this.employees,
      this.trade_code,
      this.processes_employed,
      this.services_available,
      this.work_undertaken,
    );
  }

  public static csvHeaders(): string {
    return format(
      '"%s","%s","%s","%s","%s","%s","%s","%s"\n',
      'Raw String',
      'Name',
      'Postcode',
      'Address',
      'No. Employees',
      'Trade Code',
      'Processes Employed',
      'Services Available',
      'Work Undertaken',
    );
  }

  private mapBusinessCodes(codes: string[]): string {
    return codes.map(c => PrintersTradeServiceCodes[c]).join(', ');
  }
}
