import * as babel from 'babel-core';
import generate from 'babel-generator';
import testcheck from 'testcheck';
import transform from './transform';
import GEN from './GEN';

const gen = testcheck.gen;

function generateSample(fileName, args, callback) {
  // eslint-disable-next-line import/no-dynamic-require
  const ast = require(`./__fixtures__/${fileName}`);
  const sourceAst = transform(babel, ast);
  const {code} = generate(sourceAst);

  let fn;
  // eslint-disable-next-line no-eval
  eval(`var ${GEN} = gen; fn = ${code};`);

  const sample = testcheck.sample(fn(...args))[0];
  callback(sample);
}

describe(`transform`, () => {
  it(`transforms a simple ast`, done => {
    generateSample(`transform-01`, [], result => {
      expect(typeof result.firstName).toEqual(`string`);
      done();
    });
  });

  it(`transforms an ast with generic inputs`, done => {
    generateSample(`transform-02`, [gen.string], result1 => {
      expect(typeof result1.firstName).toEqual(`string`);

      generateSample(`transform-02`, [gen.int], result2 => {
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
