import { gen } from 'testcheck';
import faker from 'faker';

const error = msg => {
  throw new Error(`babel-plugin-transform-flow-to-gen/types: ${msg}`);
};

const isUndefined = obj => typeof obj === `undefined`;
const isFunction = obj => typeof obj === `function`;
const isObject = obj =>
  !Array.isArray(obj) &&
  typeof obj === `object` &&
  Object.prototype.toString.call(obj) === `[object Object]`;

export const object = (shape, indexers = []) => {
  if (!isObject(shape)) {
    error(`types.object did not receive object as it's argument.`);
  }
  return combine(
    (...args) => Object.assign({}, ...args),
    shape,
    ...indexers.map(([key, value]) => gen.object(key, value)),
  );
};

export const array = (value, type) => {
  if (isUndefined(value)) {
    error(`types.array did not receive an argument.`);
  }

  return [...Array(Math.floor(Math.random() * 10))].map(() => type());
};

export const literal = obj => {
  if (isUndefined(obj)) {
    error(`types.literal did not receive an argument.`);
  }

  return obj;
};

export const boolean = () => faker.random.boolean();

export const string = () => {
  const result = faker.name.findName();
  return result;
};

export const number = () => faker.random.number();

export const union = arr => {
  if (!Array.isArray(arr)) {
    error(`types.union expected array as argument.`);
  }

  return oneOf(arr);
};

export const intersection = arr => {
  if (!Array.isArray(arr)) {
    error(`types.intersection expected array as argument.`);
  }

  return arr.reduce((accum, item) => { return { ...accum, ...item }; });
  // return arr.reduce(
  //   (interGen, typeGen) =>
  //     gen.bind(interGen, inter => gen.map(type => Object.assign({}, inter, type), typeGen)),
  //   gen.return({}),
  // );
};

export const tuple = arr => {
  if (!Array.isArray(arr)) {
    error(`types.tuple expected array as argument.`);
  }

  return arr;
};

export const keys = type => {
  if (isUndefined(type)) {
    error(`types.keys expected an argument.`);
  }

  // const key =
  //   gen.bind(type, obj => {
  //     if (!isObject(obj)) {
  //       error(`types.keys expected a object generator.`);
  //     }

  //     const _keys = Object.keys(obj);
  //     return oneOf(_keys);
  //   });
  return array(oneOf(Object.keys(type)));
  // return array(key);
};

export const shape = type => {
  return type;
  // return gen.bind(keys(type), _keys => {
  //   return gen.map(
  //     obj => {
  //       if (!isObject(obj)) {
  //         error(`types.shape expected a object generator.`);
  //       }

  //       return _keys.reduce((acc, key) => Object.assign({}, acc, { [key]: obj[key] }), obj);
  //     },
  //     type,
  //   );
  // });
};

export const undef = () => null;

export const nullable = type => {
  if (isUndefined(type)) {
    error(`types.nullable did not receive an argument.`);
  }

  return oneOf([undef(), type]);
};

const oneOf = arr => arr[Math.floor(Math.random() * arr.length)];

export const generic = (obj, args = []) => {
  if (isUndefined(obj)) {
    error(`types.generic expected a generator or a function to create one.`);
  }

  if (!isFunction(obj)) {
    return obj;
  }
  // if (obj && isFunction(obj.asGenerator)) {
  //   return gen.bind(undef(), () => obj.asGenerator(...args));
  // }
  return obj(...args);
};

export const map = (type, mapFn) => {
  if (!isFunction(mapFn)) {
    error(
      `types.map expected a generator function as first argument. Instead got ${JSON.stringify(mapFn)}.`,
    );
  }

  return mapFn(type);
};

export const mock = () => (typeof jest === `object` ? jest.fn() : () => { });
// gen.bind(
//   undef(),
//   () =>
//     // use a jest mock if this is being run with jest
//     (typeof jest === `object` ? gen.return(jest.fn()) : gen.return(() => { })),
// );

export const garbage = () => `garbage`;

export const empty = () => { };

export const combine = (fn, ...args) => {
  function recurse(gens, vals) {
    if (gens.length === 0) {
      return literal(fn(...vals));
    }

    return { ...gens[0], ...recurse(gens.slice(1), vals) };
    // gen.bind(gens[0], val => {
    //   console.log('vals', vals);
    //   return recurse(gens.slice(1), vals.concat(val));
    // }
    // );
  }

  return recurse(args, []);
};
