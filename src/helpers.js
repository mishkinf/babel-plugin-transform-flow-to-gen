import {gen} from 'testcheck';

export const combine = (fn, ...args) => {
  function recurse(gens, vals) {
    if (gens.length === 0) {
      return literal(fn(...vals));
    }

    return gen.bind(gens[0], val => recurse(gens.slice(1), vals.concat(val)));
  }

  return recurse(args, []);
};
