import * as babel from 'babel-core';
import GEN from './GEN_ID';
import createGenFromAST from './createGenFromAST';
import createTypeAST from './createTypeAST';

const {types: t} = babel;

const requireStatement = babel.template(
  `var ${GEN} = require('babel-plugin-transform-flow-to-gen/types');`
)();

function typeParams(path) {
  if (path && path.params) {
    return path.params.map(param => ({
      name: param.name
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
  const type = createTypeAST(typeAnnotation);
  const params = typeParams(typeParameters);

  return babel.template(`function NAME(...args) {REQUIRE; PARAMS; return GEN;}`)({
    NAME: t.identifier(name),
    REQUIRE: requireStatement,
    PARAMS: createParams(params),
    GEN: createGenFromAST(type, params),
  });
}
