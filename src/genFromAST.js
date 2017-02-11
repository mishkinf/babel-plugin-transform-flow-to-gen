import * as babel from 'babel-core';
import GEN from './GEN_ID';

const {types: t} = babel;

const expression = (str, args) =>
  babel.template(str)(args).expression;

function typeToGen(obj, params = []) {
  switch (obj.type) {
    case `generator`: {
      return expression(`${GEN}.map(ARG, CALL)`, {
        ARG: genFromAST(obj.typeAlias, params),
        CALL: t.identifier(obj.caller),
      });
    }
    case `typeAlias`: {
      let index = -1;
      let i = 0;
      const len = params.length;

      while (i < len) {
        if (params[i].name === obj.name) {
          index = i;
          break;
        }

        i += 1;
      }

      if (index === -1) {
        // wrap in a gen.bind so that recursion is lazy
        return expression(`${GEN}.typeAlias(CALL, ARGS)`, {
          CALL: t.identifier(obj.name),
          ARGS: t.arrayExpression(
            obj.args.map(a => genFromAST(a, params)),
          ),
        });
      }

      return t.identifier(obj.name);
    }
    case `object`: {
      const keys = Object.keys(obj.members);

      const fromMembers = expression(`${GEN}.plainObject(OBJ)`, {
        OBJ: t.objectExpression(
          keys.map(key =>
            t.objectProperty(
              t.identifier(key),
              genFromAST(obj.members[key], params),
            ),
          ),
        ),
      });

      if (obj.indexers.length === 0) {
        return fromMembers;
      }

      const [indexer] = obj.indexers;

      const fromIndexer = expression(`${GEN}.indexedObject(KEYS, VALUES)`, {
        KEYS: genFromAST(indexer.key),
        VALUES: genFromAST(indexer.value)
      });

      return expression(`${GEN}.combine((a, b) => Object.assign({}, a, b), MEMBERS, INDEXER)`, {
        MEMBERS: fromMembers,
        INDEXER: fromIndexer
      });
    }
    case `typeAliasKeys`:
      return expression(`${GEN}.array(${GEN}.keys(OBJ))`, {
        OBJ: genFromAST(obj.typeAlias, params),
      });
    case `typeAliasShape`:
      return expression(`${GEN}.shape(OBJ)`, {
        OBJ: genFromAST(obj.typeAlias, params),
      });
    case `array`:
      return expression(`${GEN}.array(VAL)`, {
        VAL: genFromAST(obj.elementType, params),
      });
    case `literal`:
      return t.identifier(`${GEN}.literal(${JSON.stringify(obj.value)})`);
    case `boolean`:
      return t.identifier(`${GEN}.boolean()`);
    case `string`:
      return t.identifier(`${GEN}.string()`);
    case `number`:
      return t.identifier(`${GEN}.number()`);
    case `union`:
      return expression(`${GEN}.union(ARR)`, {
        ARR: t.arrayExpression(
          obj.entries.map(val => genFromAST(val, params)),
        ),
      });

    case `intersection`:
      return expression(`${GEN}.intersection(ARR)`, {
        ARR: t.arrayExpression(
          obj.entries.map(val => genFromAST(val, params)),
        ),
      });
    case `tuple`:
      return expression(`${GEN}.tuple(ARR)`, {
        ARR: t.arrayExpression(
          obj.entries.map(val => genFromAST(val, params)),
        ),
      });
    case `function`:
      return t.identifier(`${GEN}.mock()`);
    case `nullable`:
      return expression(`${GEN}.nullable(OBJ)`, {
        OBJ: genFromAST(obj.value, params),
      });
    case `garbage`:
      return t.identifier(`${GEN}.garbage()`);
    default:
      return t.identifier(`${GEN}.undef()`);
  }
}

export default function genFromAST(obj, params) {
  const gen = typeToGen(obj, params);

  if (obj.optional === true) {
    return expression(`${GEN}.nullable(OBJ)`, {
      OBJ: gen,
    });
  }

  return gen;
}
