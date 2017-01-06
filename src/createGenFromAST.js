import * as babel from 'babel-core';
import GEN from './GEN_ID';

const {types: t} = babel;

function typeToGen(obj, params = []) {
  switch (obj.type) {
    case `generator`: {
      return babel.template(`${GEN}.generator(CALL)`)({
        CALL: t.identifier(obj.name),
      }).expression;
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
        return babel.template(`${GEN}.typeAlias(CALL, ARGS)`)({
          CALL: t.identifier(obj.name),
          ARGS: t.arrayExpression(
            obj.args.map(a => createGenFromAST(a, params)),
          ),
        }).expression;
      }

      return t.identifier(obj.name);
    }
    case `object`: {
      const keys = Object.keys(obj.members);

      return babel.template(`${GEN}.object(OBJ)`)({
        OBJ: t.objectExpression(
          keys.map(key =>
            t.objectProperty(
              t.identifier(key),
              createGenFromAST(obj.members[key], params),
            ),
          ),
        ),
      }).expression;
    }
    case `typeAliasKeys`:
      return babel.template(`${GEN}.array(${GEN}.keys(OBJ))`)({
        OBJ: createGenFromAST(obj.typeAlias),
      }).expression;
    case `array`:
      return babel.template(`${GEN}.array(VAL)`)({
        VAL: createGenFromAST(obj.elementType, params),
      }).expression;
    case `literal`:
      return t.identifier(`${GEN}.literal(${JSON.stringify(obj.value)})`);
    case `boolean`:
      return t.identifier(`${GEN}.boolean()`);
    case `string`:
      return t.identifier(`${GEN}.string()`);
    case `number`:
      return t.identifier(`${GEN}.number()`);
    case `union`:
      return babel.template(`${GEN}.union(ARR)`)({
        ARR: t.arrayExpression(
          obj.entries.map(val => createGenFromAST(val, params)),
        ),
      }).expression;

    case `intersection`:
      return babel.template(`${GEN}.intersection(ARR)`)({
        ARR: t.arrayExpression(
          obj.entries.map(val => createGenFromAST(val, params)),
        ),
      }).expression;
    case `tuple`:
      return babel.template(`${GEN}.tuple(ARR)`)({
        ARR: t.arrayExpression(
          obj.entries.map(val => createGenFromAST(val, params)),
        ),
      }).expression;
    case `function`:
      return t.identifier(`${GEN}.mock()`);
    case `nullable`:
      return babel.template(`${GEN}.nullable(OBJ)`)({
        OBJ: createGenFromAST(obj.value, params),
      }).expression;
    default:
      return t.identifier(`${GEN}.undef()`);
  }
}

export default function createGenFromAST(obj, params) {
  const gen = typeToGen(obj, params);

  // this isn`t totally correct.
  // key should optionally not be present as well.
  if (obj.optional === true) {
    return babel.template(`${GEN}.nullable(OBJ)`)({
      OBJ: gen,
    }).expression;
  }

  return gen;
}
