// @flow

export type Person<T> = {
  firstName: string,
  lastName?: string,
  age: number,
  misc: Info<T>
};

type Info<T> = {
  eyeColor: T
};
