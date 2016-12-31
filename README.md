# Flow to gen

_Transforms flow type aliases into testcheck.js generators_

## Motivation

TODO:

- More tests
- End-to-end tests
- Transforms for functions to auto generate their args

## Demo?

[DEMO!](https://demo-ehefklufbm.now.sh/)

## Getting Started

This library transforms your type aliases into testcheck.js generators to make testing easier.

```js
import testcheck, {gen} from 'testcheck';

type Person<T> = {
  firstName: string,
  lastName: string,
  age: T
}

const personGen = Person(gen.posInt);

const samples = testcheck.sample(personGen);
// returns on array of Person's
// [{
//   "firstName": "9OY3o",
//   "lastName": "fB",
//   "age": 0
// },
// {
//   "firstName": "8Hft5LwfK",
//   "lastName": "51Vnn54vb9xHO",
//   "age": 2
// },
// {
//   "firstName": "7i59Sr35GAJiv626uiV",
//   "lastName": "s7GIgEf",
//   "age": 3
// },
// {
//   "firstName": "Mys89F65i36n921",
//   "lastName": "",
//   "age": 1
// }, ...]
```

## Installing

```js
yarn add babel-transform-flow-to-gen
```

## License

MIT
