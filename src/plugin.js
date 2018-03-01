/* eslint-disable no-param-reassign */
export default function (babel) {
  const { types: t } = babel;

  const defaultTypeParameters = t.typeParameterInstantiation([]);
  let $GEN; // assigned in pre-hook;

  const iife = babel.template(
    `
      (function() {
        const id = exp;
        id.asGenerator = gen;
        return id;
      })();
    `
  );

  const expression = str => {
    const template = babel.template(str);

    return obj => {
      return template({ ...obj, $GEN }).expression
    };
  };

  const stripTypes = node => {
    if (node.params)
      node.params.forEach(param => {
        param.typeAnnotation = null;
      });
    node.typeParameters = null;
    node.returnType = null;
  };

  const isConstructor = path =>
    t.isClassMethod(path) && path.node.kind === `constructor`;

  const shapeExp = expression(`$GEN.shape(type)`);
  const keysExp = expression(`$GEN.keys(type)`);
  const mapExp = expression(`$GEN.map(type, func)`);
  const genericExp = expression(`$GEN.generic(type, [args])`);
  const objectExp = expression(`$GEN.object(type, indexers)`);
  const arrayExp = expression(`$GEN.array(type, elementType)`);
  const literalExp = expression(`$GEN.literal(id)`);
  const intersectionExp = expression(`$GEN.intersection(arr)`);
  const tupleExp = expression(`$GEN.tuple(arr)`);
  const unionExp = expression(`$GEN.union(arr)`);
  const nullableExp = expression(`$GEN.nullable(type)`);
  const mockExp = expression(`$GEN.mock()`);
  const garbageExp = expression(`$GEN.garbage()`);
  const numberExp = expression(`$GEN.number()`);
  const stringExp = expression(`$GEN.string()`);
  const booleanExp = expression(`$GEN.boolean()`);
  const undefinedExp = expression(`$GEN.undef()`);

  const wrap = path => {
    const { node } = path;
    const { params, typeParameters } = node;
    const id = node.id || node.key || path.scope.generateUidIdentifier();
    let { body } = node;

    if (!t.isBlockStatement(body)) {
      body = t.blockStatement([t.returnStatement(body)]);
    }

    const paramsTypeAnnotation = t.tupleTypeAnnotation(
      params.map(
        p =>
          p.typeAnnotation
            ? p.typeAnnotation.typeAnnotation
            : t.anyTypeAnnotation()
      )
    );

    const gen = makeGen(paramsTypeAnnotation, typeParameters);

    const exp = t.functionExpression(null, params, body);
    exp.async = node.async;
    exp.generator = node.generator;
    stripTypes(exp);

    return iife({ id, exp, gen });
  };

  const makeGen = (typeAnnotation, typeParameters) => {
    typeParameters = typeParameters || defaultTypeParameters;

    const blockStatement = babel.template(
      `{
        const [args] = arguments;
        return gen;
      }`
    )({
      args: typeParameters.params,
      gen: toGen(typeAnnotation)
    });

    return t.functionExpression(null, [], blockStatement);
  };

  const makeGenInstance = (id, typeAnnotation, typeParameters) => {
    typeParameters = typeParameters || defaultTypeParameters;

    const gen = toGen(typeAnnotation);

    const mapToInstance = mapExp({
      type: gen
      //func: expression(`function(...args) { return new id(...args); }`)({id})
    });

    const blockStatement = babel.template(
      `{
        const [args] = arguments;
        return gen;
      }`
    )({
      args: typeParameters.params,
      gen: mapToInstance
    });

    return t.functionExpression(null, [], blockStatement);
  };

  const toGen = node => {
    switch (node.type) {
      case `GenericTypeAnnotation`: {
        switch (node.id.name) {
          case `Array`: {
            const type = node.typeParameters.params[0];
            return toGen(t.arrayTypeAnnotation(type));
          }
          case `Object`:
            return toGen(t.objectTypeAnnotation([]));
          case `$Shape`: {
            const type = toGen(node.typeParameters.params[0]);
            return shapeExp({ type });
          }
          case `$Subtype`:
            return toGen(node.typeParameters.params[0]);
          case `$Keys`: {
            const type = toGen(node.typeParameters.params[0]);
            return keysExp({ type });
          }
          case `$Gen`: {
            const [type, func] = node.typeParameters.params;
            return mapExp({ type: toGen(type), func });
          }
          default: {
            const typeParameters = node.typeParameters || defaultTypeParameters;
            return genericExp({
              type: node.id,
              args: typeParameters.params.map(toGen)
            });
          }
        }
      }
      case `ObjectTypeAnnotation`: {
        node.indexers = node.indexers || [];

        const properties = node.properties.map(prop => {
          const value = toGen(prop.value);

          return t.objectProperty(prop.key, value);
        });

        const indexers = node.indexers.map(idx =>
          t.arrayExpression([toGen(idx.key), toGen(idx.value)]));

        return objectExp({
          type: t.objectExpression(properties),
          indexers: t.arrayExpression(indexers)
        });
      }
      case `ArrayTypeAnnotation`: {
        return arrayExp({ type: toGen(node.elementType), elementType: node.elementType });
      }
      case `NullLiteralTypeAnnotation`: {
        const id = t.identifier(`null`);
        return literalExp({ id });
      }
      case `NumericLiteralTypeAnnotation`:
      case `StringLiteralTypeAnnotation`:
      case `BooleanLiteralTypeAnnotation`: {
        const id = t.identifier(JSON.stringify(node.value));
        return literalExp({ id });
      }
      case `IntersectionTypeAnnotation`: {
        const arr = node.types.map(toGen);
        return intersectionExp({ arr: t.arrayExpression(arr) });
      }
      case `TupleTypeAnnotation`: {
        const arr = node.types.map(toGen);
        return tupleExp({ arr: t.arrayExpression(arr) });
      }
      case `UnionTypeAnnotation`: {
        const arr = node.types.map(toGen);
        return unionExp({ arr: t.arrayExpression(arr) });
      }
      case `NullableTypeAnnotation`:
        return nullableExp({ type: toGen(node.typeAnnotation) });
      case `FunctionTypeAnnotation`:
        return mockExp();
      case `AnyTypeAnnotation`:
      case `MixedTypeAnnotation`:
        return garbageExp();
      case `NumberTypeAnnotation`:
        return numberExp();
      case `StringTypeAnnotation`:
        return stringExp();
      case `BooleanTypeAnnotation`:
        return booleanExp();
      case `VoidTypeAnnotation`:
      default:
        return undefinedExp();
    }
  };

  return {
    name: `flow-to-gen`,
    // inherits: require(`babel-plugin-syntax-flow`),
    pre(state) {
      $GEN = state.scope.generateUidIdentifier(`$GEN`);
    },
    visitor: {
      Program(path) {
        const decl = babel.template(
          `
          const $GEN = require('babel-plugin-transform-flow-to-gen/lib/typeHelpers');
        `
        )({ $GEN });

        path.unshiftContainer(`body`, decl);
      },
      ExportDefaultDeclaration(path) {
        const { node } = path;
        const decl = node.declaration;
        const id = decl.id || path.scope.generateUidIdentifier();

        if (t.isFunctionDeclaration(decl)) {
          decl.expression = true;
          decl.type = `FunctionExpression`;
        } else if (t.isClassDeclaration(decl)) {
          decl.expression = true;
          decl.type = `ClassExpression`;
        }

        const next = babel.template(
          `
              const id = decl;
              exports.default = id;
          `
        )({ decl, id });

        path.replaceWithMultiple(next);
      },
      ImportDeclaration(path) {
        const { node } = path;

        if (node.importKind === `type`) {
          node.importKind = `value`;
        }
      },
      TypeAlias(path) {
        const { node } = path;
        const id = path.scope.generateUidIdentifier(node.id.name);
        const gen = makeGen(node.right, node.typeParameters);

        const exp = iife({
          id,
          exp: gen,
          gen: id
        });

        const next = babel.template(
          `
            const id = exp;
          `
        )({ id: node.id, exp });

        path.replaceWith(next);
        path.skip();
      },
      Class: {
        exit(path) {
          const { node } = path;
          const constructor = path.get(`body.body`).find(isConstructor);
          const id = path.scope.generateUidIdentifier();
          const typeParameters = node.typeParameters;
          const params = constructor ? constructor.node.params : [];

          if (t.isClassDeclaration(node)) {
            node.expression = true;
            node.type = `ClassExpression`;
          }

          const paramsTypeAnnotation = t.tupleTypeAnnotation(
            params.map(
              p =>
                p.typeAnnotation
                  ? p.typeAnnotation.typeAnnotation
                  : t.anyTypeAnnotation()
            )
          );

          const gen = makeGenInstance(id, paramsTypeAnnotation, typeParameters);

          const exp = iife({
            id,
            exp: node,
            gen
          });

          const next = babel.template(
            `
              const id = exp;
            `
          )({ id: node.id, exp });

          if (constructor) {
            stripTypes(constructor.node);
          }

          stripTypes(node);
          path.replaceWith(next);
          path.skip();
        }
      },

      Function: {
        exit(path) {
          const { node } = path;

          if (isConstructor(path)) {
            return;
          }

          let next = wrap(path);

          if (t.isFunctionDeclaration(path)) {
            next = babel.template(`const id = next;`)({ id: node.id, next });
          } else if (t.isObjectMethod(path)) {
            next = t.objectProperty(node.key, next.expression);
          } else if (t.isClassMethod(path)) {
            next = t.classProperty(node.key, next.expression);
            next.static = node.static;
          }

          path.replaceWith(next);
          path.skip();
        }
      }
    }
  };
}
