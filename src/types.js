import {gen} from 'testcheck';

const error = msg =>
  throw new Error(`babel-plugin-transform-flow-to-gen/types: ${msg}`);

const isUndefined = obj => typeof obj === 'undefined';

const isObject = obj =>
  !Array.isArray(obj) && typeof obj === 'object';

export const object = shape => {
  if (!isObject(shape)) {
    error(`types.object did not receive object as it's argument.`)
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

  return arr.reduce((interGen, typeGen) => {
    return gen.bind(interGen, inter => {
      return gen.map(type => {
        return Object.assign({}, inter, type);
      }, typeGen);
    });
  }, gen.return({}));
};

export const tuple = arr => {
  if (!Array.isArray(arr)) {
    error(`types.tuple expected array as argument.`);
  }

  return arr.reduce((interGen, typeGen) => {
    return gen.bind(interGen, inter => {
      return gen.map(type => {
        return inter.concat(type);
      }, typeGen);
    });
  }, gen.return([]));
};

export const nullable = type => {
  if (isUndefined(type)) {
    error(`types.nullable did not receive an argument.`);
  }

  return gen.oneOf([gen.undefined, type]);
}

export const generic = (fn, args = []) =>
  gen.bind(gen.undefined, () => {
    const result = fn.apply(null, args);

    if (isUndefined(result)) {
      error(`types.generic function returned undefined`);
    }

    return result;
  });

export const noop = () =>
  gen.return(function(){});

export const empty = () =>
  gen.return({});

export default {
  object,
  array,
  literal,
  boolean,
  string,
  number,
  union,
  intersection,
  tuple,
  nullable,
  generic,
  noop,
  empty
};
