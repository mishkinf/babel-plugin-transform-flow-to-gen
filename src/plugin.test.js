import path from 'path';
import * as babel from 'babel-core';
import {sample} from 'testcheck';
import plugin from './plugin';
import * as types from './types';
import GEN from './GEN_ID';

function pluginTransform(fileName, exported) {
  const filePath = path.join(__dirname, `__fixtures__`, `${fileName}.js`);
  const {code} = babel.transformFileSync(filePath, {
    sourceType: `module`,
    plugins: [`syntax-flow`, plugin, `transform-flow-comments`],
  });

  console.log(code)

  // hacky way to confirm that plugin is working
  // eslint-disable-next-line no-eval
  eval(code);
  const fn = exports[exported];
  delete exports[exported];

  return fn;
}

describe(`plugin`, () => {
  it(`kindasorta makes sure that the babel plugin works on types`, () => {
    const Worker = pluginTransform(`end-to-end-01`, `Worker`);

    const T = types.object({
      stuff: types.boolean(),
    });

    const workerGen = Worker(T);

    sample(workerGen).forEach(worker => {
      expect(typeof worker.firstName).toEqual(`string`);

      if (worker.lastName === `` || worker.lastName) {
        expect(typeof worker.lastName).toEqual(`string`);
      } else {
        expect(worker.lastName).toEqual(null);
      }

      expect(typeof worker.age).toEqual(`number`);
      expect([`blue`, `brown`, `green`]).toContain(worker.misc.eyeColor);
      expect([`blonde`, `brown`, `red`]).toContain(worker.misc.hairColor);
      expect(typeof worker.isCool).toEqual(`boolean`);
      expect(typeof worker.update).toEqual(`function`);
      expect(worker.update()).toEqual(undefined);
      expect(typeof worker.jobTitle).toEqual(`string`);
      expect(typeof worker.other.stuff).toEqual(`boolean`);
    });
  });

  it(`kindasorta makes sure that the babel plugin works on functions`, () => {
    const fn = pluginTransform(`end-to-end-02`, `exported`);

    sample(fn[GEN]).forEach(args => {
      expect(fn(...args)).toEqual(args[0] + args[1]);
    });
  });

  it(`kindasorta makes sure that the babel plugin works on functions with type aliases`, () => {
    const setName = pluginTransform(`end-to-end-03`, `setName`);

    sample(setName[GEN]).forEach(args => {
      const [person, name] = args;
      const newPerson = setName(person, name);

      expect(newPerson).not.toEqual(person);
      expect(newPerson.name).toEqual(name);
      expect(typeof newPerson.other.eyeColor).toEqual('string');
    });
  });
});
