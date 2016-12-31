import path from 'path';
import * as babel from 'babel-core';
import testcheck, {gen} from 'testcheck';
import plugin from './plugin';

describe(`plugin`, () => {
  it(`kindasorta makes sure that the babel plugin works`, () => {
    const filePath = path.join(__dirname, `__fixtures__`, `end-to-end-01.js`);
    const {code} = babel.transformFileSync(filePath, {
      sourceType: `module`,
      plugins: [`syntax-flow`, plugin],
    });

    // hacky way to confirm that plugin is working
    // eslint-disable-next-line no-eval
    eval(code);
    const {Worker} = exports;
    delete exports.Worker;

    const T = gen.object({
      stuff: gen.boolean,
    });

    const workerGen = Worker(T);

    testcheck.sample(workerGen).forEach(worker => {
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
});
