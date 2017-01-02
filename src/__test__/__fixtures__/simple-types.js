// @flow

export type Pizza = 'pizza';
export type IceCream = 'ice cream';
export type Tacos = 'tacos';

export type Food = Pizza | IceCream | Tacos;

export type Blonde = 'blonde';
export type Brown = 'brown';
export type Red = 'red';

export type Age = number;

export type Misc = {
  eyeColor: 'blue' | 'brown' | 'green',
  hairColor: Blonde | Brown | Red
};

export type Person = {
  firstName: string,
  lastName: ?string,
  age: Age,
  isCool: boolean,
  isMonster: false,
  misc: Misc,
  voidedThing: void,
  favoriteFoods: Food[],
  update: (p: Person) => Person
};

export type Job<T> = {
  jobTitle: string,
  other: T
};

export type Worker<T> = Person & Job<T>;
