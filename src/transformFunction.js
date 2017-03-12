import * as babel from 'babel-core';
import transform from './transform';
import GEN from './GEN_ID';

const {types: t} = babel;

export default function transformFunction(name, funcParams = [], typeParameters) {
  const args = t.tupleTypeAnnotation(funcParams.map(a => a.typeAnnotation.typeAnnotation));

  const fnName = `${GEN}__${name}`;

  const fn = transform(fnName, args, typeParameters);

  return babel.template(`FUNC; ${name}.asGenerator = ${fnName};`)({
    FUNC: fn,
  });
}
