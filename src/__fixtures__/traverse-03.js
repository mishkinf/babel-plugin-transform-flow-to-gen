// @flow

export type Person<T: string> = {
  firstName: string,
  lastName?: string,
  age: number,
  misc: T
};
