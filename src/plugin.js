import traverseType from './traverseType';
import transformType from './transformType';
import GEN from './GEN_ID';

export default function (babel) {
  const {types: t} = babel;

  return {
    inherits: require(`babel-plugin-syntax-flow`),

    visitor: {
      Program(path) {
        const len = path.node.body.length;
        let index = -1;
        let i = 0;

        while (i < len) {
          const statement = path.node.body[i];
          const isTypeAlias = t.isTypeAlias(statement);
          const isTypeAliasExport = (
            t.isExportNamedDeclaration(statement) &&
            t.isTypeAlias(statement.declaration)
          );

          if (isTypeAlias || isTypeAliasExport) {
            index = i;
            break;
          }

          i += 1;
        }

        if (index > -1) {
          const requireStatement = babel.template(`const ${GEN} = require('babel-plugin-transform-flow-to-gen/types');`)();
          path.node.body.splice(index, 0, requireStatement);
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
        const ast = transformType(babel, traverseType(path));
        path.replaceWithMultiple(ast);
      },
    },
  };
}
