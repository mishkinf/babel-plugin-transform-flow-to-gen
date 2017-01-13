import {gen} from 'testcheck';
import GEN from './GEN_ID';

const error = msg => {
  throw new Error(`babel-plugin-transform-flow-to-gen/types: ${msg}`);
};

const toString = Object.prototype.toString;

const isUndefined = obj => typeof obj === `undefined`;
const isFunction = obj => typeof obj === `function`;
const isObject = obj => (
  !Array.isArray(obj) &&
  typeof obj === `object` &&
  toString.call(obj) === `[object Object]`
);

export const object = shape => {
  if (!isObject(shape)) {
    error(`types.object did not receive object as it's argument.`);
  }

  return gen.object(shape);
};

export const array = type => {
  if (isUndefined(type)) {
    error(`types.array did not receive an argument.`);
  }

  return gen.array(type);
};

export const literal = obj => {
  if (isUndefined(obj)) {
    error(`types.literal did not receive an argument.`);
  }

  return gen.return(obj);
};

export const boolean = () =>
  gen.boolean;

export const string = (size = 20) =>
  gen.resize(size, gen.alphaNumString);

export const number = () =>
  gen.int;

export const union = arr => {
  if (!Array.isArray(arr)) {
    error(`types.union expected array as argument.`);
  }

  return gen.oneOf(arr);
};

export const intersection = arr => {
  if (!Array.isArray(arr)) {
    error(`types.intersection expected array as argument.`);
  }

  return arr.reduce((interGen, typeGen) =>
    gen.bind(interGen, inter =>
      gen.map(type => Object.assign({}, inter, type), typeGen),
    ), gen.return({}),
  );
};

export const tuple = arr => {
  if (!Array.isArray(arr)) {
    error(`types.tuple expected array as argument.`);
  }

  return arr.reduce((interGen, typeGen) =>
    gen.bind(interGen, inter =>
      gen.map(type => inter.concat(type), typeGen),
    ), gen.return([]),
  );
};

export const keys = type => {
  if (isUndefined(type)) {
    error(`types.keys expected an argument.`);
  }

  return gen.bind(type, obj => {
    if (!isObject(obj)) {
      error(`types.keys expected a object generator.`);
    }

    const keyss = Object.keys(obj);
    return gen.returnOneOf(keyss);
  });
};

export const shape = type =>
  gen.bind(array(keys(type)), keyss =>
    gen.map(obj => {
      if (!isObject(obj)) {
        error(`types.shape expected a object generator.`);
      }

      return keyss.reduce((acc, key) => Object.assign({}, acc, {[key]: obj[key]}), obj);
    }, type),
  );

export const undef = () => gen.undefined;

export const nullable = type => {
  if (isUndefined(type)) {
    error(`types.nullable did not receive an argument.`);
  }

  return gen.oneOf([undef(), type]);
};

export const typeAlias = (fn, args = []) => {
  if (!fn || !isFunction(fn[GEN])) {
    error(`types.typeAlias expected a typeAlias as first argument. Instead got ${JSON.stringify(fn)}.`);
  }

  return gen.bind(undef(), () => fn[GEN](...args));
};

export const generator = (type, mapFn) => {
  if (!isFunction(mapFn)) {
    error(`types.generator expected a generator function as first argument. Instead got ${JSON.stringify(mapFn)}.`);
  }

  return gen.map(mapFn, type);
};

export const mock = () =>
  gen.bind(undef(), () =>
    // use a jest mock if this is being run with jest
    (typeof jest === `object` ? gen.return(jest.fn()) : gen.return(() => {})),
  );

export const garbage = () => gen.any;

export const empty = () =>
  gen.return({});
