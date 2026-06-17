import * as util from 'util';

import { isDate, toNumber, trim } from 'lodash';

import { format } from 'date-fns';

export const inspectData = (message: string | object) => {
  if (typeof message === 'object') {
    console.log(util.inspect(message, false, null, true));
    return;
  }
  console.log(message);
};

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== 'number' && value === '') {
    return true;
  } else if (typeof value === 'undefined' || value === undefined) {
    return true;
  } else if (
    value !== null &&
    typeof value === 'object' &&
    !Object.keys(value).length
  ) {
    return true;
  } else {
    return false;
  }
};

/**
 * Checks if a value is truthy.
 * @param value - The value to be checked.
 * @returns Returns true if the value is truthy, otherwise returns false.
 */
export const isTruthy = (value: unknown): boolean => {
  if (isDate(value)) {
    return true;
  } else if (typeof value === 'object' && value !== null) {
    return Object.keys(value).length > 0;
  } else if (Array.isArray(value)) {
    return value.length > 0;
  } else if (typeof value === 'string') {
    return trim(value).length > 0;
  } else if (typeof value === 'number') {
    return !Number.isNaN(value);
  } else {
    return Boolean(value);
  }
};

export interface PaymentForItem {
  name: string;
  amount: number;
}

/**
 * Extracts items from a given input string and converts them into an array of PaymentForItem objects.
 */
export function transformInputToPaymentArray(input: string): PaymentForItem[] {
  const regex = /\(([^)]+)\)/g;
  const result: PaymentForItem[] = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    const [name, value] = match[1].split(' - ');
    result.push({
      name: name.trim(),
      amount: parseInt(value.trim(), 10),
    });
  }

  return result;
}

/**
 * Calculates the sum of the values of a specified key in an array of objects.
 */
export const sumArrayValuesBy = (
  arr: Record<string, unknown>[],
  key: string,
): number => {
  return arr.reduce(
    (acc: number, obj: Record<string, unknown>) => acc + toNumber(obj[key]),
    0,
  );
};

/**
 * Checks if a given date is a valid Date object.
 */
export const isValidDate = (date: Date) => {
  const d = new Date(date);
  const isDateInstance = d instanceof Date;
  if (!isDateInstance) {
    return false;
  } else {
    return !isNaN(d.getTime());
  }
};

export function validateDate(date: Date | string | number | null | undefined) {
  if (!date) {
    return '';
  }
  if (new Date(date).toString() === 'Invalid Date') {
    return `Invalid Date`;
  }
  if (!isValidDate(new Date(date))) {
    return `Invalid Date`;
  }
  return true;
}

export function formatDate(
  date: Date | string | number | null | undefined,
): string {
  if (validateDate(date) !== true) {
    return `${validateDate(date)}`;
  }
  return `${format(new Date(date as Date), 'yyyy-MM-dd')}`;
}

export function formatDateTime(date: Date | string | number | null): string {
  if (validateDate(date) !== true) {
    return `${validateDate(date)}`;
  }
  return format(new Date(date as Date), 'yyyy-MM-dd HH:mm:ss');
}

export function formatTime(date: Date | string | number | null): string {
  if (validateDate(date) !== true) {
    return `${validateDate(date)}`;
  }
  return format(new Date(date as Date), 'HH:mm:ss a');
}

/**
 * Normalizes an MSISDN (phone number) to E.164 format with a leading `+`.
 */
export function normalizeMsisdn(msisdn: string): string {
  const trimmed = msisdn.trim();
  return trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
}

/**
 * Formats a number as a financial amount with comma separators.
 */
export function formatFinancialAmount(
  amount: number | string | undefined | null,
): string {
  if (amount === null || amount === undefined) {
    return '0';
  }
  const numericAmount =
    typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) {
    return '0';
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}
