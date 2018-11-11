import { format } from 'util';

interface Business {
  address: {
    full: string | '';
    postcode: string | '';
  };
  name: string;
  employees: string;
  original_string: string;
  processes_employed: string;
  services_available: string;
  work_undertaken: string;
}

enum BusinessServiceCodes {
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
const businessCodeRegex = /\n([A-X]+) ([^\n]*)\n/;
const addressRegex = /^[^\n]*\n(.*)\nTel/s;

function mapBusinessCodes(businessCodes: string[]): string {
  if (businessCodes) {
    return businessCodes.map(c => BusinessServiceCodes[c]).join(', ');
  } else {
    return '';
  }
}

export function csvHeaders(): string {
  return format(
    '"%s","%s","%s","%s","%s","%s","%s","%s"\n',
    'Directory Entry',
    'Name',
    'Postcode',
    'Address',
    'No. Employees',
    'Processes Employed',
    'Services Available',
    'Work Undertaken',
  );
}

export function formatDirectoryEntry(directoryEntry: Business): string {
  return format(
    '"%s","%s","%s","%s","%s","%s","%s","%s"\n',
    directoryEntry.original_string,
    directoryEntry.name,
    directoryEntry.address.postcode,
    directoryEntry.address.full,
    directoryEntry.employees,
    directoryEntry.processes_employed,
    directoryEntry.services_available,
    directoryEntry.work_undertaken,
  );
}

export function parseDirectoryEntry(directoryEntry: string): Business {
  const addressMatch = directoryEntry.match(addressRegex);
  const postcodeMatch = directoryEntry.match(ukPostcodeRegex);
  const businessCodeMatch = directoryEntry.match(businessCodeRegex);

  return {
    address: {
      full: addressMatch ? addressMatch[1].replace(/\n/, ' ') : '',
      postcode: postcodeMatch ? postcodeMatch[0] : '',
    },
    employees: businessCodeMatch ? businessCodeMatch[2] : '',
    name: directoryEntry.split(/\n/)[0],
    original_string: directoryEntry,
    processes_employed: businessCodeMatch
      ? mapBusinessCodes(businessCodeMatch[1].match(/[A-G]/g))
      : '',
    services_available: businessCodeMatch
      ? mapBusinessCodes(businessCodeMatch[1].match(/[Q-X]/g))
      : '',
    work_undertaken: businessCodeMatch
      ? mapBusinessCodes(businessCodeMatch[1].match(/[H-P]/g))
      : '',
  };
}
