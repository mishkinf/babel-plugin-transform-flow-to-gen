/* eslint-disable no-param-reassign */

import GEN from './GEN_ID';
import transformType from './transformType';
import transformFunction from './transformFunction';

export default function (babel) {
  const {types: t} = babel;

  const allParamsAreTyped = path =>
    !!(path.params && path.params.length > 0 && path.params.every(p => !!p.typeAnnotation));

  const walkToScope = path => {
    while (!t.SCOPABLE_TYPES.includes(path.parentPath.type)) {
      path = path.parentPath;
    }

    return path;
  };

  let nameCount = 0;
  const nextName = () => {
    nameCount += 1;
    return `${GEN}_EXP_${nameCount}__`;
  };

  return {
    inherits: require(`babel-plugin-syntax-flow`),

    visitor: {
      ImportDeclaration(path) {
        const node = path.node;

        if (node.importKind === `type`) {
          node.importKind = `value`;
        }
      },

      ExportNamedDeclaration(path) {
        const node = path.node;

        if (node.exportKind === `type`) {
          const {declaration} = node;

          node.exportKind = `value`;

          if (declaration) {
            const namedExport = {
              type: `ExportNamedDeclaration`,
              specifiers: [t.exportSpecifier(declaration.id, declaration.id)],
              exportKind: `value`,
            };

            path.replaceWithMultiple([declaration, namedExport]);
          }
        }
      },

      TypeAlias(path) {
        const node = path.node;
        const ast = transformType(node.id.name, node.right, node.typeParameters);
        path.replaceWithMultiple(ast);
      },

      FunctionDeclaration(path) {
        const node = path.node;

        if (!allParamsAreTyped(node)) {
          return;
        }

        const name = node.id.name;
        const fn = transformFunction(name, node.params, node.typeParameters);
        const root = walkToScope(path);
        const nodes = [root.node].concat(fn);
        root.replaceWithMultiple(nodes);
      },

      FunctionExpression(path) {
        const node = path.node;

        if (!allParamsAreTyped(node)) {
          return;
        }

        if (t.isVariableDeclarator(path.parentPath)) {
          const {name} = path.parentPath.node.id;
          const fn = transformFunction(name, node.params, node.typeParameters);
          const root = walkToScope(path);
          const nodes = [root.node].concat(fn);
          root.replaceWithMultiple(nodes);
        }

        if (t.isReturnStatement(path.parentPath)) {
          node.id = node.id || t.identifier(nextName());
          const {name} = node.id;
          const fn = transformFunction(name, node.params, node.typeParameters);
          const root = path.parentPath;
          const nodes = [node].concat(fn).concat(t.returnStatement(t.identifier(name)));
          root.replaceWithMultiple(nodes);
        }
      },

      // just transform to function expression to avoid dealing with more AST semantics
      ArrowFunctionExpression(path) {
        const node = path.node;

        const id = t.identifier(nextName());
        const params = node.params;
        let body = node.body;

        if (!t.isBlockStatement(body)) {
          body = t.blockStatement([t.returnStatement(body)]);
        }

        const exp = t.functionExpression(id, params, body);
        exp.typeParameters = node.typeParameters;

        path.replaceWith(exp);
      },
    },
  };
}
