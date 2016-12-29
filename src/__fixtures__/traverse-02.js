// @flow

export type Person<T> = {
  firstName: string,
  lastName?: string,
  age: number,
  misc: T
};
