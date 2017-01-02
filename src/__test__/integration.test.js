import {sample} from 'testcheck';
import {loadFixture, expectType} from './helpers';
import * as types from 'babel-plugin-transform-flow-to-gen/types';

describe('babel-plugin-transform-flow-to-gen', () => {
  it(`works with simple types`, () => {
    const {Person, Job, Worker} = loadFixture(`simple-types`);

    sample(Person()).forEach(person => {
      expectType(person.firstName, 'string');
      expectType(person.lastName, 'string', true);
      expectType(person.age, 'number');
      expectType(person.isCool, 'boolean');

      expect(['blue', 'brown', 'green']).toContain(person.misc.eyeColor);
      expect(['blonde', 'brown', 'red']).toContain(person.misc.hairColor);

      expect(Array.isArray(person.favoriteFoods)).toBeTruthy();

      person.favoriteFoods.forEach(food => {
        expect(['pizza', 'ice cream', 'tacos']).toContain(food);
      });
    });

    const other = types.object({
      a: types.string(),
      b: types.boolean()
    });

    sample(Job(other)).forEach(job => {
      expectType(job.jobTitle, 'string');
      expectType(job.other, 'object');
      expectType(job.other.a, 'string');
      expectType(job.other.b, 'boolean');
    });

    sample(Job(types.string())).forEach(job => {
      expectType(job.other, 'string');
    });

    sample(Worker(other)).forEach(worker => {
      expectType(worker.firstName, 'string');
      expectType(worker.jobTitle, 'string');
      expectType(worker.other.a, 'string');
    });
  });

  it(`works with simple function types`, () => {
    const {concat, setName, setNameThenCallback} = loadFixture(`simple-functions`);

    sample(concat.$GEN).forEach(args => {
      expect(concat(...args)).toEqual(args[0] + args[1]);
    });

    sample(setName.$GEN).forEach(args => {
      const [person, name] = args;
      const newPerson = setName(person, name);

      expect(newPerson).not.toEqual(person);
      expect(newPerson.name).toEqual(name);
      expect(typeof newPerson.other.eyeColor).toEqual('string');
    });

    sample(setNameThenCallback.$GEN).forEach(args => {
      const [person, name, fn] = args;

      // returns a jest mock
      expect(fn).toHaveBeenCalledTimes(0);

      const newPerson = setNameThenCallback(person, name, fn);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn.mock.calls[0][0]).toEqual({
        ...person,
        name
      });
    });
  });
});