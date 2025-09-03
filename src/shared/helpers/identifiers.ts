// import { OrganizationIdType } from '@idoeasy/contracts';

// export function validateIdentifier(kind: OrganizationIdType, value: string): boolean {
//   const v = (value || '').trim();
//   switch (kind) {
//     case OrganizationIdType.CNPJ:
//       return isValidCNPJ(v);
//     case OrganizationIdType.EIN:
//       return isValidEIN(v);
//     case OrganizationIdType.VAT:
//       return looksLikeEuVat(v);
//     case OrganizationIdType.TRN:
//       return isValidUaeTRN(v);
//     case OrganizationIdType.CR:
//       return /^[0-9A-Za-z\-\/\s]{3,}$/.test(v);
//     case OrganizationIdType.TAX_ID:
//       return /^[0-9A-Za-z\-\/\s]{3,}$/.test(v);
//     default:
//       return v.length > 0;
//   }
// }

// export function isValidCNPJ(raw: string): boolean {
//   const digits = (raw || '').replace(/\D+/g, '');
//   if (digits.length !== 14) return false;
//   if (/^(\d)\1{13}$/.test(digits)) return false;

//   const calcCheck = (base: string, weights: number[]) => {
//     const sum = base.split('').reduce((acc, d, i) => acc + parseInt(d, 10) * weights[i], 0);
//     const mod = sum % 11;
//     return mod < 2 ? 0 : 11 - mod;
//   };

//   const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
//   const w2 = [6, ...w1];

//   const d1 = calcCheck(digits.slice(0, 12), w1);
//   const d2 = calcCheck(digits.slice(0, 12) + d1, w2);

//   return digits.endsWith(String(d1) + String(d2));
// }

// export function isValidEIN(raw: string): boolean {
//   const s = (raw || '').trim();
//   if (!/^\d{2}-?\d{7}$/.test(s)) return false;
//   return !/^00/.test(s.replace('-', ''));
// }

// const shapes: Record<string, RegExp> = {
//   DE: /^DE\d{9}$/,
//   FR: /^FR[0-9A-Z]{2}\d{9}$/,
//   ES: /^ES[0-9A-Z]\d{7}[0-9A-Z]$/,
//   IT: /^IT\d{11}$/,
//   IE: /^IE[0-9A-Z]{7,8}[0-9A-Z]?$/,
//   PL: /^PL\d{10}$/,
// };

// export function looksLikeEuVat(raw: string): boolean {
//   const s = (raw || '').toUpperCase().replace(/\s+/g, '');
//   const cc = s.slice(0, 2);
//   const rx = shapes[cc];
//   return !!rx && rx.test(s);
// }

// export function isValidUaeTRN(raw: string): boolean {
//   const digits = (raw || '').replace(/\D+/g, '');
//   return /^\d{15}$/.test(digits);
// }

// export function isValidSaudiVAT(raw: string): boolean {
//   const digits = (raw || '').replace(/\D+/g, '');
//   return /^\d{15}$/.test(digits);
// }
