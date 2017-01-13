import * as babel from 'babel-core';
import transform from './transform';
import GEN from './GEN_ID';

const requireStatement = babel.template(
  `require('babel-plugin-transform-flow-to-gen/lib/sampleOne').default;`,
)();

export default function transformType(name, typeAnnotation, typeParameters) {
  const fnName = `${GEN}__${name}`;

  const fn = transform(fnName, typeAnnotation, typeParameters);

  return babel.template(`
    function ${name}(...args) {
      var sampleOne = REQUIRE;
      return sampleOne(${fnName}(...args));
    }
    FUNC;
    ${name}.${GEN} = ${fnName};
  `)({
    REQUIRE: requireStatement,
    FUNC: fn,
  });
}
