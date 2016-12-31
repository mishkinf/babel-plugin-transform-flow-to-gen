import {gen} from 'testcheck';

export const object = shape =>
  gen.object(shape);

export const array = type =>
  gen.array(type);

export const literal = obj =>
  gen.return(obj);

export const boolean = () =>
  gen.boolean;

export const string = (size = 20) =>
  gen.resize(size, gen.alphaNumString);

export const number = () =>
  gen.int;

export const union = arr =>
  gen.oneOf(arr);

export const intersection = arr =>
  arr.reduce((interGen, typeGen) => {
    return gen.bind(interGen, inter => {
      return gen.map(type => {
        return Object.assign({}, inter, type);
      }, typeGen);
    });
  }, gen.return({}));

export const tuple = arr =>
  arr.reduce((interGen, typeGen) => {
    return gen.bind(interGen, inter => {
      return gen.map(type => {
        return inter.concat(type);
      }, typeGen);
    });
  }, gen.return([]));

export const nullable = type =>
  gen.oneOf([gen.undefined, type]);

export const generic = (fn, args = []) =>
  gen.bind(gen.undefined, () => fn.apply(null, args));

export const noop = () =>
  gen.return(function(){});

export const empty = () =>
  gen.return({});
