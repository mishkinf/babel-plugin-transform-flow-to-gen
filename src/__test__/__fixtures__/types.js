// @flow

import type {$Gen} from 'babel-plugin-transform-flow-to-gen/Gen';

export type Pizza = 'pizza';
export type IceCream = 'ice cream';
export type Tacos = 'tacos';

export type Food = Pizza | IceCream | Tacos;

export type Movie = 'Inception' | 'Jurassic Park' | 'Wayne\'s World';

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
  middleName?: string,
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

const alwaysABC = () => [`A`, `B`, `C`];

const convertToLengthString = str => str.length.toString();

type SomeKeys = {
  A: string,
  BB: string,
  CCC: string,
  DDDD: string
};

export type Critic = {
  favoriteMovies: Array<Movie>,
  style: Object,
  favoriteLetters: $Gen<string[], alwaysABC>,
  numberToLetter: $Gen<string, convertToLengthString>,
  someKeys: $Keys<SomeKeys>,
  misc: $Shape<Misc>,
  friend: $Subtype<Person>,
  nothing: null,
  nonsense: any,
  justANumber: 2,
  numberSubtype: $Subtype<1>
};

export type FoodForMovies = {
  [key: Food]: Movie
};

export type OtherIndexer = {
  [derp: Food]: Movie
};
