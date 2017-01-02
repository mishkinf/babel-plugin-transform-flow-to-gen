import * as babel from 'babel-core';
import generate from "babel-generator";
import createTypeAST from './createTypeAST';
import createGenFromAST from './createGenFromAST';
import transformType from './transformType';
import GEN from './GEN_ID';

const { types: t } = babel;

export default function transformFunction(name, funcParams = [], typeParameters) {
  const args = t.tupleTypeAnnotation(
    funcParams.map(a => a.typeAnnotation.typeAnnotation)
  );

  const fnName = `${GEN}__${name}`;

  const fn = transformType(fnName, args, typeParameters);

  console.log(generate(fn).code);

  return babel.template(`FUNC; ${name}.${GEN} = ${fnName};`)({
    FUNC: fn
  });
};
