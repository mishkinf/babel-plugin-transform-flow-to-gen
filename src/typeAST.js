export default function typeAst(path, optional = false) {
  const type = path.type.replace(`TypeAnnotation`, ``).toLowerCase();
  const base = {type, optional};

  switch (type) {
    case `generic`: {
      const {typeParameters} = path;
      const name = path.id.name;
      const args =
        (typeParameters && typeParameters.params) ?
          typeParameters.params.map(p => typeAst(p)) :
          [];

      return {...base, name, args};
    }
    case `object`: {
      return path.properties.reduce((acc, prop) => {
        const key = prop.key.name;
        const opt = prop.optional;
        const value = typeAst(prop.value, opt);
        return {
          ...acc,
          members: {
            ...acc.members,
            [key]: value,
          },
        };
      }, {...base, members: {}});
    }
    case `array`: {
      const elementType = typeAst(path.elementType);
      return {...base, elementType};
    }
    case `stringliteral`: {
      const value = path.value;
      return {...base, value};
    }
    case `intersection`:
    case `tuple`:
    case `union`: {
      const entries = path.types.map(p => typeAst(p));
      return {...base, entries};
    }
    case `nullable`: {
      const value = typeAst(path.typeAnnotation);
      return {...base, value};
    }

    // case 'function':
    // case 'string':
    // case 'number':
    // case 'boolean':
    default:
      return {...base};
  }
}
