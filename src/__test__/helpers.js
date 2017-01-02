import path from 'path';
import * as babel from 'babel-core';
import plugin from '../plugin';

export function loadFixture(fileName) {
  const filePath = path.join(__dirname, `./__fixtures__`, `${fileName}.js`);
  const {code} = babel.transformFileSync(filePath, {
    sourceType: `module`,
    plugins: [`syntax-flow`, plugin, `transform-flow-comments`],
  });

  // hacky way to confirm that plugin is working
  // eslint-disable-next-line no-eval
  let result;
  eval(`exports = {}; ${code}; result = exports; exports = {};`);

  return result;
}

export function expectType(value, type, nullable = false) {
  expect(
    (typeof value === type) ||
    (nullable && (value === null))
  ).toBeTruthy();
}
