import {sample} from 'testcheck';
import * as types from '../typeHelpers';
import {loadFixture, expectType} from './helpers';

const isPerson = person => {
  expectType(person.firstName, `string`);
  expectType(person.middleName, `string`, true);
  expectType(person.lastName, `string`, true);
  expectType(person.age, `number`);
  expectType(person.isCool, `boolean`);
  expectType(person.isMonster, `boolean`);

  expect(person.isMonster).toEqual(false);
  expect([`blue`, `brown`, `green`]).toContain(person.misc.eyeColor);
  expect([`blonde`, `brown`, `red`]).toContain(person.misc.hairColor);

  expect(Array.isArray(person.favoriteFoods)).toBeTruthy();

  person.favoriteFoods.forEach(food => {
    expect([`pizza`, `ice cream`, `tacos`]).toContain(food);
  });
};

describe(`babel-plugin-transform-flow-to-gen`, () => {
  const typesFixture = loadFixture(`types`);

  const {
    Critic,
    FoodForMovies,
    Job,
    Person,
    RecursiveThing,
    Worker
  } = typesFixture;

  it(`works with simple types`, () => {
    sample(Person()).forEach(isPerson);

    const other = types.plainObject({
      a: types.string(),
      b: types.boolean(),
    });

    sample(Job(other)).forEach(job => {
      expectType(job.jobTitle, `string`);
      expectType(job.other, `object`);
      expectType(job.other.a, `string`);
      expectType(job.other.b, `boolean`);
    });

    sample(Job(types.string())).forEach(job => {
      expectType(job.other, `string`);
    });

    sample(Worker(other)).forEach(worker => {
      isPerson(worker);
      expectType(worker.jobTitle, `string`);
      expectType(worker.other.a, `string`);
    });
  });

  it(`handles special generics appropriately`, () => {
    let foundMiscEyeColor = false;
    let foundMiscHairColor = false;

    sample(Critic()).forEach(critic => {
      expect(Array.isArray(critic.favoriteMovies)).toBeTruthy();
      expectType(critic.style, `object`);
      expectType(critic.version, `string`);
      expect(critic.version[0], `v`);
      expect(critic.favoriteLetters).toEqual([`A`, `B`, `C`]);
      expect(parseInt(critic.numberToLetter, 10)).toBeGreaterThan(-1);

      expect(Array.isArray(critic.someKeys)).toBeTruthy();

      critic.someKeys.forEach(key => {
        expect([`A`, `BB`, `CCC`, `DDDD`]).toContain(key);
      });

      expect(Object.keys(critic.misc).length).toBeLessThanOrEqual(2);

      if (critic.misc.eyeColor) {
        foundMiscEyeColor = true;
      }

      if (critic.misc.hairColor) {
        foundMiscHairColor = true;
      }

      isPerson(critic.friend);

      expect(critic.nothing).toEqual(null);
      expect(critic.justANumber).toEqual(2);
      expect(critic.numberSubtype).toEqual(1);
    });

    expect(foundMiscEyeColor).toEqual(true);
    expect(foundMiscHairColor).toEqual(true);
  });

  it(`works with indexers on objects`, () => {
    sample(FoodForMovies()).forEach(obj => {
      const keys = Object.keys(obj);

      keys.forEach(key => {
        const value = obj[key];

        expect([`pizza`, `ice cream`, `tacos`]).toContain(key);
        expect(['Inception', 'Jurassic Park', 'Wayne\'s World']).toContain(value);
      });
    });
  });

  it(`works with simple function types`, () => {
    const {
      concat,
      setName,
      setNameThenCallback,
      setNameWithGeneric,
    } = loadFixture(`functions`);

    sample(concat.asGenerator()).forEach(args => {
      expect(concat(...args)).toEqual(args[0] + args[1]);
    });

    sample(setName.asGenerator()).forEach(args => {
      const [person, name] = args;
      const newPerson = setName(person, name);

      expect(newPerson).not.toEqual(person);
      expect(newPerson.name).toEqual(name);
      expect(typeof newPerson.other.eyeColor).toEqual(`string`);
    });

    sample(setNameThenCallback.asGenerator()).forEach(args => {
      const [person, name, fn] = args;

      // returns a jest mock
      expect(fn).toHaveBeenCalledTimes(0);

      setNameThenCallback(person, name, fn);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn.mock.calls[0][0]).toEqual({
        ...person,
        name,
      });
    });

    sample(setNameWithGeneric.asGenerator(types.number())).forEach(args => {
      const [person] = args;

      expectType(person.name, `string`);
      expectType(person.age, `number`);
      expectType(person.other, `number`);
    });
  });

  it(`can pass along re-exported types`, () => {
    expect(typesFixture.hasOwnProperty('Pizza')).toEqual(true);
    expect(typesFixture.hasOwnProperty('IceCream')).toEqual(true);
    expect(typesFixture.hasOwnProperty('Tacos')).toEqual(true);
  });

  it(`can add generators to nested functions`, () => {
    const {
      nestedFunction,
      otherNestedFunction
    } = loadFixture(`functions`);

    expectType(nestedFunction.asGenerator, `function`);
    expectType(nestedFunction().asGenerator, `function`);
    expectType(otherNestedFunction().a.asGenerator, `function`);
    expectType(otherNestedFunction().b.asGenerator, `function`);
  })
});
