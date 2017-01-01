import * as babel from 'babel-core';
import createTypeAST from './createTypeAST';
import createGenFromAST from './createGenFromAST';
import GEN from './GEN_ID';

const { types: t } = babel;

const allParamsAreTyped = path => !!(
  path.params &&
  path.params.length > 0 &&
  path.params.every(p => !!p.typeAnnotation)
);

const walkToRoot = path => {
  while (!t.isProgram(path.parentPath)) {
    path = path.parentPath;
  }

  return path;
}

const getName = (() => {
  let i = 0;

  return path => {
    if (t.isFunctionDeclaration(path)) {
      return path.node.id.name;
    } else if (t.isArrowFunctionExpression(path) && !t.isCallExpression(path.parentPath)) {
      return path.parentPath.node.id.name;
    } else {
      return `${GEN}_${i++}_`;
    }
  };
})();

export default function transformFunction(path) {
  if (allParamsAreTyped(path.node)) {
    const root = walkToRoot(path);
    const program = root.parentPath.node;
    const params = path.node.params || [];
    const name = getName(path);
    const index = program.body.indexOf(root.node);

    path.node.id = t.identifier(name);

    program.body.splice(
      index + 1,
      0,
      babel.template(`${name}.${GEN} = ${GEN}.tuple(ARR)`)({
        ARR: t.arrayExpression(
          params.map(p => createGenFromAST(createTypeAST(p.typeAnnotation.typeAnnotation)), [])
        )
      })
    );
  }
};
