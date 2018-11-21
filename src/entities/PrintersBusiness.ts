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

const csvHeadersMap = {
  rawString: 'Raw String',
  name: 'Name',
  postcode: 'Postcode',
  address: 'Address',
  employees: 'No. Employees',
  trade_code: 'Trade Code',
  processes_employed: 'Processes Employed',
  services_available: 'Services Available',
  work_undertaken: 'Work Undertaken',
};

export function stringToEntity(s: string) {
  return new PrintersBusiness(s);
}

export class PrintersBusiness {
  constructor(private rawString: string) {}

  get name(): string {
    return this.rawString.split(/\n/)[0];
  }

  get address(): string {
    const address = this.rawString.match(addressRegex);
    return address ? address[1].replace(/\n/, ' ') : '';
  }

  get postcode(): string {
    const postcode = this.rawString.match(ukPostcodeRegex);
    return postcode ? postcode[0] : '';
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
    const values = Object.keys(csvHeadersMap).map(k => this[k]);
    return format(`${values.map(_ => '"%s"').join(',')}`, ...values);
  }

  public static csvHeaders(): any {
    const values = Object.keys(csvHeadersMap).map(k => csvHeadersMap[k]);
    return format(`${values.map(_ => '"%s"').join(',')}`, ...values);
  }

  private mapBusinessCodes(codes: string[]): string {
    return codes.map(c => PrintersTradeServiceCodes[c]).join(', ');
  }
}
