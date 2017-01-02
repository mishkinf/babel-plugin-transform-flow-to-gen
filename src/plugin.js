import transformType from './transformType';
import transformFunction from './transformFunction';
import GEN from './GEN_ID';

export default function (babel) {
  const {types: t} = babel;

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
  };

  let funcExpressionCounter = 0;

  return {
    inherits: require(`babel-plugin-syntax-flow`),

    visitor: {
      Program(path) {
        const len = path.node.body.length;
        let index = -1;
        let i = 0;

        while (i < len) {
          const statement = path.node.body[i];

          if (!t.isImportDeclaration(statement)) {
            index = i;
            break;
          }

          i += 1;
        }

        index = (index > -1) ? index : len;

        const requireStatement = babel.template(`const ${GEN} = require('babel-plugin-transform-flow-to-gen/types');`)();
        path.node.body.splice(index, 0, requireStatement);
      },

      ImportDeclaration(path) {
        if (path.node.importKind === `type`) {
          // eslint-disable-next-line no-param-reassign
          path.node.importKind = `value`;
        }
      },

      ExportNamedDeclaration(path) {
        if (path.node.exportKind === `type`) {
          const {declaration} = path.node;

          const namedExport = {
            type: `ExportNamedDeclaration`,
            specifiers: [t.exportSpecifier(
              declaration.id,
              declaration.id,
            )],
            exportKind: `value`,
          };

          path.replaceWithMultiple([declaration, namedExport]);
        }
      },

      TypeAlias(path) {
        const {node} = path;
        const ast = transformType(node.id.name, node.right, node.typeParameters);
        path.replaceWithMultiple(ast);
      },

      FunctionDeclaration(path) {
        const root = walkToRoot(path);

        if (allParamsAreTyped(path.node)) {
          const name = path.node.id.name;
          const fn = transformFunction(name, path.node.params, path.node.typeParameters);
          root.insertAfter(fn);
        }
      },

      FunctionExpression(path) {
        const root = walkToRoot(path);

        if (allParamsAreTyped(path.node)) {
          const name = path.node.id = t.identifier(`${GEN}__${funcExpressionCounter++}`);
          const fn = transformFunction(name, path.node.params, path.node.typeParameters);
          root.insertAfter(fn);
        }
      },

      ArrowFunctionExpression(path) {
        const root = walkToRoot(path);

        if (allParamsAreTyped(path.node) && !t.isCallExpression(path.parentPath)) {
          const name = path.parentPath.node.id.name;
          const fn = transformFunction(name, path.node.params, path.node.typeParameters);
          root.insertAfter(fn);
        }
      }
    },
  };
}
