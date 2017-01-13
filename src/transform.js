import * as babel from 'babel-core';
import GEN from './GEN_ID';
import genFromAST from './genFromAST';
import typeAST from './typeAST';

const {types: t} = babel;

const requireStatement = babel.template(
  `var ${GEN} = require('babel-plugin-transform-flow-to-gen/lib/typeHelpers');`,
)();

function typeParams(path) {
  if (path && path.params) {
    return path.params.map(param => ({
      name: param.name,
    }));
  }

  return [];
}

function createParams(params) {
  if (params.length === 0) {
    return null;
  }

  return t.variableDeclaration(`var`, [
    t.variableDeclarator(
      t.arrayPattern(params.map(p => t.identifier(p.name))),
      t.identifier(`args`),
    ),
  ]);
}

export default function transform(name, typeAnnotation, typeParameters) {
  const type = typeAST(typeAnnotation);
  const params = typeParams(typeParameters);

  return babel.template(`function NAME(...args) {REQUIRE; PARAMS; return GEN;}`)({
    NAME: t.identifier(name),
    REQUIRE: requireStatement,
    PARAMS: createParams(params),
    GEN: genFromAST(type, params),
  });
}
