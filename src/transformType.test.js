import generate from 'babel-generator';
import testcheck from 'testcheck';
import transformType from './transformType';
import GEN from './GEN_ID';
import * as types from './types';

function generateSample(fileName, args, callback) {
  // eslint-disable-next-line import/no-dynamic-require
  const ast = require(`./__fixtures__/${fileName}`);
  const sourceAst = transformType(ast);
  const {code} = generate(sourceAst);

  let fn;
  // eslint-disable-next-line no-eval
  eval(`var ${GEN} = require('./types'); fn = ${code};`);

  const sample = testcheck.sample(fn(...args))[0];
  callback(sample);
}

describe(`transformType`, () => {
  it(`transforms a simple ast`, done => {
    generateSample(`transform-01`, [], result => {
      expect(typeof result.firstName).toEqual(`string`);
      done();
    });
  });

  it(`transforms an ast with generic inputs`, done => {
    generateSample(`transform-02`, [types.string()], result1 => {
      expect(typeof result1.firstName).toEqual(`string`);

      generateSample(`transform-02`, [types.number()], result2 => {
        expect(typeof result2.firstName).toEqual(`number`);
        done();
      });
    });
  });

  // FIXME
  // it(`transforms an ast with recursion`, done => {
  //   generateSample(`transform-03`, [], result => {
  //     expect(typeof result.firstName).toEqual(`string`);
  //     done();
  //   });
  // });
});
