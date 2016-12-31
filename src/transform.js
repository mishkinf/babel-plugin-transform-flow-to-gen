import GEN from './GEN';

export default function transform(babel, obj) {
  const {types: t} = babel;

  function typeToGen(params, obj) {
    switch (obj.type) {
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
      case `stringliteral`: {
        return t.identifier(`${GEN}.return('${obj.value}')`);
      }
      case `boolean`:
        return t.identifier(`${GEN}.boolean`);
      case `string`:
        return t.identifier(`${GEN}.resize(20, ${GEN}.alphaNumString)`);
      case `number`:
        return t.identifier(`${GEN}.int`);
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
          return babel.template(`${GEN}.bind(${GEN}.undefined, () => WRAPPED)`)({
            WRAPPED:
              t.callExpression(
                t.identifier(obj.name),
                obj.args.map(a => createGen(params, a)),
              )
          }).expression;
        }

        return t.identifier(obj.name);
      }
      case `union`:
        return babel.template(`${GEN}.oneOf(ARR)`)({
          ARR: t.arrayExpression(
            obj.entries.map(val => createGen(params, val)),
          ),
        }).expression;

      case `intersection`:
        return babel.template(`
          ARR.reduce((interGen, typeGen) => {
            return ${GEN}.bind(interGen, inter => {
              return ${GEN}.map(type => {
                return Object.assign({}, inter, type);
              }, typeGen);
            });
          }, ${GEN}.return({}));
        `)({
          ARR: t.arrayExpression(
            obj.entries.map(val => createGen(params, val)),
          ),
        }).expression;
      case `tuple`:
        return babel.template(`
          ARR.reduce((interGen, typeGen) => {
            return ${GEN}.bind(interGen, inter => {
              return ${GEN}.map(type => {
                return inter.concat(type);
              }, typeGen);
            });
          }, ${GEN}.return([]));
        `)({
          ARR: t.arrayExpression(
            obj.entries.map(val => createGen(params, val)),
          ),
        }).expression;
      case `function`:
        return t.identifier(`${GEN}.return(function(){})`);
      case `nullable`:
        return babel.template(`${GEN}.oneOf([${GEN}.undefined, OBJ])`)({
          OBJ: createGen(params, obj.value),
        }).expression;
      default:
        return t.identifier(`${GEN}.return({})`);
    }
  }

  function createGen(params, obj) {
    const gen = typeToGen(params, obj);

    // this isn`t totally correct.
    // key should optionally not be present as well.
    if (obj.optional === true) {
      return babel.template(`${GEN}.oneOf([${GEN}.undefined, OBJ])`)({
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
    NAME: t.identifier(obj.name),
    PARAMS: createParams(obj.params),
    GEN: createGen(obj.params, obj.type),
  });
}
