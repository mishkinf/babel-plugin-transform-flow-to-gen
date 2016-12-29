// @flow

export type Person = {
  firstName: string,
  lastName?: string,
  age: number,
  misc: Info
};

type Info = {
  eyeColor: string
};
