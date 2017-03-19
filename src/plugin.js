/* eslint-disable no-param-reassign */

import transformType from './transformType';
import transformFunction from './transformFunction';

export default function (babel) {
  const {types: t} = babel;

  const allParamsAreTyped = path => !!(
    path.params &&
    path.params.length > 0 &&
    path.params.every(p => !!p.typeAnnotation)
  );

  const walkToScope = path => {
    while (!t.SCOPABLE_TYPES.includes(path.parentPath.type)) {
      path = path.parentPath;
    }

    return path;
  };

  const namedExport = (input, output) => (
    {
      type: `ExportNamedDeclaration`,
      specifiers: [t.exportSpecifier(input, output)],
      exportKind: `value`,
    }
  );

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

        if (node.exportKind === `value`) {
          return;
        }

        const {declaration} = node;

        node.exportKind = `value`;

        if (declaration) {
          const {id} = declaration;
          path.replaceWithMultiple([declaration, namedExport(id, id)]);
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
        const {node, parentPath} = path;

        if (!allParamsAreTyped(node)) {
          return;
        }

        if (t.isVariableDeclarator(parentPath)) {
          const {name} = parentPath.node.id;
          const fn = transformFunction(name, node.params, node.typeParameters);
          const root = walkToScope(path);
          const nodes = [root.node].concat(fn);
          root.replaceWithMultiple(nodes);
        }

        if (t.isReturnStatement(parentPath)) {
          node.id = path.scope.generateUidIdentifier((node.id && node.id.name) || undefined);
          const {name} = node.id;
          const fn = transformFunction(name, node.params, node.typeParameters);
          const nodes = [node].concat(fn).concat(t.returnStatement(t.identifier(name)));
          parentPath.replaceWithMultiple(nodes);
        }
      },

      // just transform to function expression to avoid dealing with more AST semantics
      ArrowFunctionExpression(path) {
        const node = path.node;

        const id = path.scope.generateUidIdentifier();
        const params = node.params;
        let body = node.body;

        if (!t.isBlockStatement(body)) {
          body = t.blockStatement([t.returnStatement(body)]);
        }

        const exp = t.functionExpression(id, params, body);
        exp.typeParameters = node.typeParameters;

        path.replaceWithMultiple([exp]);
      },
    },
  };
}
