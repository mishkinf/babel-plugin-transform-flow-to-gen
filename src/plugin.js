/* eslint-disable no-param-reassign */

import expression from './expression';
import transformType from './transformType';
import transformFunction from './transformFunction';

export default function (babel) {
  const {types: t} = babel;
  const allParamsAreTyped = path => !!(
    path.params &&
    path.params.length > 0 &&
    path.params.every(p => !!p.typeAnnotation)
  );

  const walkToScope = path => path.findParent(p => p.parentPath.isScopable());

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
          path.replaceWithMultiple([declaration, expression(`exports.KEY = KEY`, {KEY: id})]);
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
          node.id = path.scope.generateUidIdentifierBasedOnNode(node);
          const {name} = node.id;
          const fn = transformFunction(name, node.params, node.typeParameters);
          const nodes = [node].concat(fn).concat(t.returnStatement(t.identifier(name)));
          parentPath.replaceWithMultiple(nodes);
        }
      },

      // just transform to function expression to avoid dealing with more AST semantics
      ArrowFunctionExpression(path) {
        const node = path.node;

        const id = path.scope.generateUidIdentifier(node);
        const params = node.params;
        let body = node.body;

        if (!t.isBlockStatement(body)) {
          body = t.blockStatement([t.returnStatement(body)]);
        }

        const exp = t.functionExpression(id, params, body);
        exp.typeParameters = node.typeParameters;

        path.replaceWithMultiple([exp]);
      },

      ObjectExpression(path) {
        if (!path.parentPath.isVariableDeclarator()) {
          return;
        }

        const ref = path.parentPath.node.id;
        let decl = path.findParent(p => p.isVariableDeclaration());

        if (decl && decl.parentPath.isExportDeclaration()) {
          decl = decl.parentPath;
        }

        path.traverse({
          FunctionExpression(childPath) {
            const prop = childPath.parentPath;

            if (!prop.isProperty() || prop.parentPath !== path) {
              return;
            }

            const key = prop.node.key;
            const childNode = childPath.node;

            const fn = transformFunction(
              `${ref.name}.${key.name}`,
              childNode.params,
              childNode.typeParameters,
            );

            decl.insertAfter(fn);
          },
          // WIP
          // ObjectMethod(childPath) {
          //   if (childPath.parentPath !== path) {
          //     return;
          //   }

          //   const key = childPath.node.key;

          //   const exp = babel.template(`REF.KEY = function(){};`)({
          //     REF: ref,
          //     KEY: key
          //   });

          //   let decl = path.findParent(p => p.isVariableDeclaration());

          //   if (decl) {
          //     if (decl.parentPath.isExportDeclaration()) {
          //       decl = decl.parentPath;
          //     }

          //     decl.insertAfter(exp);
          //   }
          // }
        });
      },
    },
  };
}
