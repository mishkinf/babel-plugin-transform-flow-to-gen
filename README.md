# Flow to gen

_Transforms flow type aliases into generators for property based testing_

## Motivation

This Babel plugin attempts to alleviate the manual task of creating and maintaining fixtures/mocks by transforming all Flowtype type aliases
into generator functions for mock data. Additionally, it provides a framework for automatically generating random input for
typed functions and React components. If you're unfamiliar with generative or property based testing, please check out an implementation of
[Quickcheck](https://en.wikipedia.org/wiki/QuickCheck) in your language of choice. Also look at
[testcheck.js](https://github.com/leebyron/testcheck-js) which is 100% compatible and wrapped by the runtime of this library.

By running this Babel transform on your code:
- all type aliases are transformed in testcheck.js generators
- all typed functions can immediately retrieve randomly generated inputs
- all typed React components can immediately retrieve randomly generated props

TODO:
- handle TypeofTypeAnnotation
- handle ExistentialTypeAnnotation
- handle recursive types
- handle Flow globally defined types
- handle type alias indexers
- handle React components

## Demo?

[DEMO!](https://demo-bhabhjfxho.now.sh/)

## Getting Started

`babel-plugin-transform-flow-to-gen` transforms your type aliases into functions
that create testcheck.js generators.

## Usage

```js
import {sample, types} from 'babel-plugin-transform-flow-to-gen';

type Person<T> = {
  firstName: string,
  lastName: string,
  age: T
}

// use the generator static member to create samples
const personGen = Person.$GEN(types.number());
sample(personGen, 20);
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

function setFirstName(person: Person<number>, firstName: string) {
  // ...
}

// returns an array of args for setFirstName
sample(setFirstName.$GEN());
// [
//  [{
//   "firstName": "3o",
//   "lastName": "j467DA",
//   "age": 0
//   }, "f02j"]
// , ...]
```

## Installing

```js
yarn add babel-plugin-transform-flow-to-gen
```

## License

MIT
