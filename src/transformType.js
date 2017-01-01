import * as babel from 'babel-core';
import GEN from './GEN_ID';
import createGenFromAST from './createGenFromAST';

const {types: t} = babel;

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

export default function transformType(type) {
  return babel.template(`
  function NAME() {PARAMS; return GEN;}
  `)({
    NAME: t.identifier(type.name),
    PARAMS: createParams(type.params),
    GEN: createGenFromAST(type.type, type.params),
  });
}
