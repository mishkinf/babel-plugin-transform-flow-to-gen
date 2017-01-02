import * as babel from 'babel-core';
import transform from './transform';
import GEN from './GEN_ID';

const requireStatement = babel.template(
  `require('babel-plugin-transform-flow-to-gen/sample');`,
)();

export default function transformType(name, typeAnnotation, typeParameters) {
  const fnName = `${GEN}__${name}`;

  const fn = transform(fnName, typeAnnotation, typeParameters);

  return babel.template(`
    function ${name}(...args) {
      var {sample} = REQUIRE;
      return sample(${fnName}(...args), 1)[0];
    }
    FUNC;
    ${name}.${GEN} = ${fnName};
  `)({
    REQUIRE: requireStatement,
    FUNC: fn,
  });
}
