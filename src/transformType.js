import * as babel from 'babel-core';
import GEN from './GEN_ID';
import createGenFromAST from './createGenFromAST';
import createTypeAST from './createTypeAST';

const {types: t} = babel;

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

  return t.variableDeclaration(`const`, [
    t.variableDeclarator(
      t.arrayPattern(params.map(p => t.identifier(p.name))),
      t.identifier(`Array.prototype.slice.call(arguments)`),
    ),
  ]);
}

export default function transformType(name, typeAnnotation, typeParameters) {
  const type = createTypeAST(typeAnnotation);
  const params = typeParams(typeParameters);

  return babel.template(`
  function NAME() {PARAMS; return GEN;}
  `)({
    NAME: t.identifier(name),
    PARAMS: createParams(params),
    GEN: createGenFromAST(type, params),
  });
}
