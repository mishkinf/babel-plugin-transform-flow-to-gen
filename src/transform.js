import GEN from './GEN_ID';

export default function transform(babel, type) {
  const {types: t} = babel;

  function typeToGen(params, obj) {
    switch (obj.type) {
      case `generic`: {
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
          return babel.template(`${GEN}.generic(CALL, ARGS)`)({
            CALL: t.identifier(obj.name),
            ARGS: t.arrayExpression(
              obj.args.map(a => createGen(params, a)),
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
                createGen(params, obj.members[key]),
              ),
            ),
          ),
        }).expression;
      }
      case `array`: {
        return babel.template(`${GEN}.array(VAL)`)({
          VAL: createGen(params, obj.elementType),
        }).expression;
      }
      case `numberliteral`:
      case `stringliteral`: {
        return t.identifier(`${GEN}.literal(${JSON.stringify(obj.value)})`);
      }
      case `boolean`:
        return t.identifier(`${GEN}.boolean()`);
      case `string`:
        return t.identifier(`${GEN}.string()`);
      case `number`:
        return t.identifier(`${GEN}.number()`);
      case `union`:
        return babel.template(`${GEN}.union(ARR)`)({
          ARR: t.arrayExpression(
            obj.entries.map(val => createGen(params, val)),
          ),
        }).expression;

      case `intersection`:
        return babel.template(`${GEN}.intersection(ARR)`)({
          ARR: t.arrayExpression(
            obj.entries.map(val => createGen(params, val)),
          ),
        }).expression;
      case `tuple`:
        return babel.template(`${GEN}.tuple(ARR)`)({
          ARR: t.arrayExpression(
            obj.entries.map(val => createGen(params, val)),
          ),
        }).expression;
      case `function`:
        return t.identifier(`${GEN}.mock()`);
      case `nullable`:
        return babel.template(`${GEN}.nullable(OBJ)`)({
          OBJ: createGen(params, obj.value),
        }).expression;
      default:
        return t.identifier(`${GEN}.empty()`);
    }
  }

  function createGen(params, obj) {
    const gen = typeToGen(params, obj);

    // this isn`t totally correct.
    // key should optionally not be present as well.
    if (obj.optional === true) {
      return babel.template(`${GEN}.nullable(OBJ)`)({
        OBJ: gen,
      }).expression;
    }

    return gen;
  }

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

  return babel.template(`
  function NAME() {PARAMS; return GEN;}
  `)({
    NAME: t.identifier(type.name),
    PARAMS: createParams(type.params),
    GEN: createGen(type.params, type.type),
  });
}
