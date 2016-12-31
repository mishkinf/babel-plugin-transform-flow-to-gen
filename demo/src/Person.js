// @flow

import {Misc} from './Misc';

type Person<T> = {
  firstName: string,
  lastName: string,
  age: number,
  misc: Misc,
  other: T
};

export {Person};
