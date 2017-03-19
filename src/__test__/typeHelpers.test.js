import {sample} from 'testcheck';
import * as types from '../typeHelpers';

describe(`typeHelpers`, () => {
  describe(`object`, () => {
    it(`returns a generated object`, () => {
      const gen = types.plainObject({
        firstName: types.string(),
        friends: types.array(types.plainObject({})),
      });

      sample(gen).forEach(s => {
        expect(typeof s).toEqual(`object`);
        expect(typeof s.firstName).toEqual(`string`);
        expect(Array.isArray(s.friends)).toBe(true);
      });
    });

    it(`throws when it does not receive an object`, () => {
      expect(() => {
        types.plainObject();
      }).toThrow(/babel-plugin-transform-flow-to-gen/);
    });
  });

  describe(`array`, () => {
    it(`returns a generated array`, () => {
      const gen = types.array(types.number());

      sample(gen).forEach(s => {
        expect(Array.isArray(s)).toBe(true);
        s.forEach(i => expect(typeof i).toEqual(`number`));
      });
    });

    it(`throws when it does not receive any argument`, () => {
      expect(() => {
        types.array();
      }).toThrow(/babel-plugin-transform-flow-to-gen/);
    });
  });

  describe(`literal`, () => {
    it(`returns a generator that returns the exact value it is passed`, () => {
      const gen = types.literal({
        a: 1,
        b: 2,
        c: {
          d: 3,
        },
      });

      sample(gen).forEach(s => {
        expect(s.a).toEqual(1);
        expect(s.b).toEqual(2);
        expect(s.c).toEqual({d: 3});
      });
    });

    it(`throws when it does not receive any argument`, () => {
      expect(() => {
        types.literal();
      }).toThrow(/babel-plugin-transform-flow-to-gen/);
    });
  });

  describe(`boolean`, () => {
    it(`returns a generated boolean`, () => {
      const gen = types.boolean();
      sample(gen).forEach(s => expect(typeof s).toEqual(`boolean`));
    });
  });

  describe(`string`, () => {
    it(`returns a generated alphanumeric string`, () => {
      const gen = types.string();
      sample(gen).forEach(s => expect(typeof s).toEqual(`string`));
    });
  });

  describe(`union`, () => {
    it(`returns a generated union type`, () => {
      const gen = types.union([types.literal(`a`), types.literal(`b`)]);

      sample(gen).forEach(s =>
        expect(s === `a` || s === `b`).toBeTruthy(),
      );
    });

    it(`throws when it does not receive an array`, () => {
      expect(() => {
        types.union();
      }).toThrow(/babel-plugin-transform-flow-to-gen/);

      expect(() => {
        types.union(types.literal(`a`), types.literal(`b`));
      }).toThrow(/babel-plugin-transform-flow-to-gen/);
    });
  });

  describe(`intersection`, () => {
    it(`returns a generated intersection of many types`, () => {
      const gen = types.intersection([
        types.plainObject({a: types.string(), b: types.string()}),
        types.plainObject({c: types.number(), d: types.boolean()}),
      ]);

      sample(gen).forEach(s => {
        expect(typeof s.a).toEqual(`string`);
        expect(typeof s.b).toEqual(`string`);
        expect(typeof s.c).toEqual(`number`);
        expect(typeof s.d).toEqual(`boolean`);
      });
    });

    it(`throws when it does not receive an array`, () => {
      expect(() => {
        types.intersection();
      }).toThrow(/babel-plugin-transform-flow-to-gen/);

      expect(() => {
        types.intersection(
          types.plainObject({a: types.string(), b: types.string()}),
          types.plainObject({c: types.number(), d: types.boolean()}),
        );
      }).toThrow(/babel-plugin-transform-flow-to-gen/);
    });
  });

  describe(`tuple`, () => {
    it(`returns a generated tuple of types`, () => {
      const gen = types.tuple([
        types.plainObject({a: types.string(), b: types.string()}),
        types.plainObject({c: types.number(), d: types.boolean()}),
      ]);

      sample(gen).forEach(s => {
        expect(typeof s[0].a).toEqual(`string`);
        expect(typeof s[0].b).toEqual(`string`);
        expect(typeof s[1].c).toEqual(`number`);
        expect(typeof s[1].d).toEqual(`boolean`);
      });
    });

    it(`throws when it does not receive an array`, () => {
      expect(() => {
        types.tuple();
      }).toThrow(/babel-plugin-transform-flow-to-gen/);

      expect(() => {
        types.tuple(
          types.plainObject({a: types.string(), b: types.string()}),
          types.plainObject({c: types.number(), d: types.boolean()}),
        );
      }).toThrow(/babel-plugin-transform-flow-to-gen/);
    });
  });

  describe(`nullable`, () => {
    it(`returns a generated maybe type of a type`, () => {
      const gen = types.nullable(types.string());
      const samp = sample(gen);

      const undefs = samp.filter(a => typeof a === `undefined`).length;
      const strings = samp.filter(a => typeof a === `string`).length;

      expect(undefs).toBeGreaterThan(0);
      expect(strings).toBeGreaterThan(0);
      expect(undefs + strings).toEqual(samp.length);
    });

    it(`throws when it does not receive a type`, () => {
      expect(() => {
        types.nullable();
      }).toThrow(/babel-plugin-transform-flow-to-gen/);
    });
  });

  describe(`typeAlias`, () => {
    it(`lazily wraps a function that returns a generator`, () => {
      const mock = {asGenerator: jest.fn(() => types.string())};

      const gen = types.typeAlias(mock, []);

      expect(mock.asGenerator).toHaveBeenCalledTimes(0);

      const samp = sample(gen);

      samp.forEach(s => {
        expect(typeof s).toEqual(`string`);
      });

      expect(mock.asGenerator).toHaveBeenCalledTimes(samp.length);
    });

    it(`throws when it does not receive a generator`, () => {
      expect(() => {
        types.typeAlias();
      }).toThrow(/babel-plugin-transform-flow-to-gen/);

      expect(() => {
        types.typeAlias({});
      }).toThrow(/babel-plugin-transform-flow-to-gen/);

      expect(() => {
        types.typeAlias(() => {});
      }).toThrow(/babel-plugin-transform-flow-to-gen/);
    });
  });

  describe(`keys`, () => {
    it(`returns a generator that randomly selects a key`, () => {
      const obj = {
        a: types.string(),
        b: types.string(),
        c: types.string(),
        d: types.string(),
      };

      const gen = types.plainObject(obj);
      const samp = sample(types.keys(gen));

      samp.forEach(s => {
        expect(Object.keys(obj)).toContain(s);
      });
    });

    it(`throws when the type isn't an object`, () => {
      expect(() => {
        types.keys();
      }).toThrow(/babel-plugin-transform-flow-to-gen/);

      expect(() => {
        sample(types.keys(types.string()));
      }).toThrow(/babel-plugin-transform-flow-to-gen/);
    });
  });

  describe(`shape`, () => {
    it(`throws when the type isn't an object`, () => {
      expect(() => {
        types.shape();
      }).toThrow(/babel-plugin-transform-flow-to-gen/);

      expect(() => {
        sample(types.shape(types.string()));
      }).toThrow(/babel-plugin-transform-flow-to-gen/);
    });
  });

  describe(`map`, () => {
    it(`throws when the type isn't a function`, () => {
      expect(() => {
        types.map();
      }).toThrow(/babel-plugin-transform-flow-to-gen/);

      expect(() => {
        types.map({});
      }).toThrow(/babel-plugin-transform-flow-to-gen/);
    });
  });

  describe(`empty`, () => {
    sample(types.empty()).forEach(s => {
      expect(s).toEqual({});
    });
  });

  describe(`mock`, () => {
    it(`creates a mock function (jest mock if available)`, () => {
      const gen = types.mock();

      sample(gen).forEach(s => {
        expect(s.mock).toBeTruthy();
      });
    });
  });
});
