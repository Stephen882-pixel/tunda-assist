import { normalizeKenyaPhoneForAmt } from './employee-amt.tool';

describe('normalizeKenyaPhoneForAmt', () => {
  it('normalises 12-digit 254', () => {
    expect(normalizeKenyaPhoneForAmt('254748717044')).toEqual({
      ok: true,
      e164: '254748717044',
    });
  });
  it('normalises 07XXXXXXXX to 2547XXXXXXXX', () => {
    expect(normalizeKenyaPhoneForAmt('0748717044')).toEqual({
      ok: true,
      e164: '254748717044',
    });
  });
  it('normalises 9 digits starting 7', () => {
    expect(normalizeKenyaPhoneForAmt('748717044')).toEqual({
      ok: true,
      e164: '254748717044',
    });
  });
});
