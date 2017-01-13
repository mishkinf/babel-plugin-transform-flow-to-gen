// @flow

import type {$Gen} from 'babel-plugin-transform-flow-to-gen/api';
import {Misc} from './Misc';

const greaterThanZero = num => Math.abs(num) + 1;

const forcedPrefix = str => `some-forced-prefix-${str}`;

type Person<T> = {
  firstName: string,
  lastName: $Gen<string, forcedPrefix>,
  age: $Gen<number, greaterThanZero>,
  misc: Misc,
  other: T
};

export {Person};
