import {sample} from 'testcheck';
import * as types from '../typeHelpers';
import {loadFixture, expectType} from './helpers';

describe(`babel-plugin-transform-flow-to-gen`, () => {
  it(`works with simple types`, () => {
    const {Person, Job, Worker} = loadFixture(`types`);

    sample(Person.$GEN()).forEach(person => {
      expectType(person.firstName, `string`);
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
    });

    const other = types.object({
      a: types.string(),
      b: types.boolean(),
    });

    sample(Job.$GEN(other)).forEach(job => {
      expectType(job.jobTitle, `string`);
      expectType(job.other, `object`);
      expectType(job.other.a, `string`);
      expectType(job.other.b, `boolean`);
    });

    sample(Job.$GEN(types.string())).forEach(job => {
      expectType(job.other, `string`);
    });

    sample(Worker.$GEN(other)).forEach(worker => {
      expectType(worker.firstName, `string`);
      expectType(worker.jobTitle, `string`);
      expectType(worker.other.a, `string`);
    });
  });

  it(`handles special generics appropriately`, () => {
    const {Critic, Misc} = loadFixture(`types`);

    const miscKeys = Object.keys(Misc());

    let foundMiscEyeColor = false;
    let foundMiscHairColor = false;

    sample(Critic.$GEN()).forEach(critic => {
      expect(Array.isArray(critic.favoriteMovies)).toBeTruthy();
      expectType(critic.style, `object`);
      expect(critic.favoriteLetters).toEqual([`A`, `B`, `C`]);

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
    });

    expect(foundMiscEyeColor).toEqual(true);
    expect(foundMiscHairColor).toEqual(true);
  });

  it(`can generate single mocks by just calling the function`, () => {
    const {Person} = loadFixture(`types`);

    const person = Person();

    expectType(person.firstName, `string`);
    expectType(person.lastName, `string`, true);
    expectType(person.age, `number`);
    expectType(person.isCool, `boolean`);

    expect([`blue`, `brown`, `green`]).toContain(person.misc.eyeColor);
    expect([`blonde`, `brown`, `red`]).toContain(person.misc.hairColor);

    expect(Array.isArray(person.favoriteFoods)).toBeTruthy();

    person.favoriteFoods.forEach(food => {
      expect([`pizza`, `ice cream`, `tacos`]).toContain(food);
    });
  });

  it(`works with simple function types`, () => {
    const {
      concat,
      setName,
      setNameThenCallback,
      setNameWithGeneric,
    } = loadFixture(`functions`);

    sample(concat.$GEN()).forEach(args => {
      expect(concat(...args)).toEqual(args[0] + args[1]);
    });

    sample(setName.$GEN()).forEach(args => {
      const [person, name] = args;
      const newPerson = setName(person, name);

      expect(newPerson).not.toEqual(person);
      expect(newPerson.name).toEqual(name);
      expect(typeof newPerson.other.eyeColor).toEqual(`string`);
    });

    sample(setNameThenCallback.$GEN()).forEach(args => {
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

    sample(setNameWithGeneric.$GEN(types.number())).forEach(args => {
      const [person] = args;

      expectType(person.name, `string`);
      expectType(person.age, `number`);
      expectType(person.other, `number`);
    });
  });
});
