import * as babel from 'babel-core';
import transform from './transform';
import GEN from './GEN_ID';

export default function transformType(name, typeAnnotation, typeParameters) {
  const fnName = `${GEN}__${name}`;

  const fn = transform(fnName, typeAnnotation, typeParameters);

  return babel.template(
    `
    FUNC;
    var ${name} = ${fnName};
    ${name}.asGenerator = ${fnName};
  `,
  )({
    FUNC: fn,
  });
}
