import path from 'path';
import * as babel from 'babel-core';
import plugin from '../plugin';

export function loadFixture(fileName) {
  const filePath = path.join(__dirname, `./__fixtures__`, `${fileName}.js`);
  const {code} = babel.transformFileSync(filePath, {
    sourceType: `module`,
    plugins: [`syntax-flow`, plugin, `transform-flow-comments`],
  });

  if (process.env.DEBUG) {
    // eslint-disable-next-line no-console
    console.log(code);
  }

  // hacky way to confirm that plugin is working
  let result;
  // eslint-disable-next-line no-eval
  eval(`exports = {}; ${code}; result = exports; exports = {};`);

  return result;
}

export function expectType(value, type, nullable = false) {
  if (type === `object`) {
    expect(!Array.isArray(value)).toBeTruthy();
  }

  expect(
    // eslint-disable-next-line valid-typeof
    (typeof value === type) ||
    (nullable && (value === null)),
  ).toBeTruthy();
}
