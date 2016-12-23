import traverse from './traverse';
import transform from './transform';
import GEN from './GEN';

export default function (babel) {
  const { types: t } = babel;

  return {
    inherits: require("babel-plugin-syntax-flow"),

    visitor: {
      Program(path) {
        const len = path.node.body.length;
        let index = -1;
        let i = -1;

        while (++i < len) {
          if (t.isTypeAlias(path.node.body[i])) {
            index = i;
            break;
          }
        }

        if (index > -1) {
          const requireStatement = babel.template(`var ${GEN} = require('testcheck').gen;`)();
          path.node.body.splice(index, 0, requireStatement);
        }
      },
      TypeAlias(path) {
        const ast = transform(babel, traverse(path));
        path.replaceWithMultiple(ast);
      }
    }
  };
}
