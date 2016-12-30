// @flow

type Blonde = 'blonde';
type Brown = 'brown';
type Red = 'red';

type Misc = {
  eyeColor: 'blue' | 'brown' | 'green',
  hairColor: Blonde | Brown | Red
};

type Person = {
  firstName: string,
  lastName: ?string,
  age: number,
  misc: Misc,
  isCool: boolean,
  update: (p: Person) => Person
};

type Job<T> = {
  jobTitle: string,
  other: T
};

export type Worker<T> = Person & Job<T>;
