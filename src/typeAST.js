const SPECIAL_GENERICS = [
  `Array`,
  `Object`,
  `$Gen`,
  `$Keys`,
  `$Shape`,
  `$Subtype`,
];

const isSpecialGeneric = name => SPECIAL_GENERICS.indexOf(name) > -1;

// eslint-disable-next-line consistent-return
const handleSpecialGeneric = (name, typeParameters, optional) => {
  const params = (typeParameters && typeParameters.params) || [];

  // eslint-disable-next-line default-case
  switch (name) {
    case `$Gen`:
      return {type: `generator`, optional, typeAlias: typeAST(params[0]), name: params[1].id.name};
    case `$Keys`: {
      const typeAlias = typeAST(params[0]);
      return {type: `typeAliasKeys`, optional, typeAlias};
    }
    case `$Shape`: {
      const typeAlias = typeAST(params[0]);
      return {type: `typeAliasShape`, optional, typeAlias};
    }
    case `$Subtype`: {
      return typeAST(params[0]);
    }
    case `Array`: {
      const elementType = typeAST(params[0]);
      return {type: `array`, optional, elementType};
    }
    case `Object`:
      return {type: `object`, optional, members: {}};
  }
};

export default function typeAST(path, optional = false) {
  const type = path.type.replace(`TypeAnnotation`, ``).toLowerCase();
  const base = {type, optional};

  switch (type) {
    case `generic`: {
      const {typeParameters} = path;
      const name = path.id.name;

      if (isSpecialGeneric(name)) {
        return handleSpecialGeneric(name, typeParameters, optional);
      }

      const args =
        (typeParameters && typeParameters.params) ?
          typeParameters.params.map(p => typeAST(p)) :
          [];

      return {type: `typeAlias`, optional, name, args};
    }
    case `object`: {
      return path.properties.reduce((acc, prop) => {
        const key = prop.key.name;
        const opt = prop.optional;
        const value = typeAST(prop.value, opt);
        return {
          ...acc,
          members: {
            ...acc.members,
            [key]: value,
          },
        };
      }, {...base, members: {}});
    }
    case `array`:
      return {...base, elementType: typeAST(path.elementType)};
    case `nullliteral`:
      return {type: `literal`, optional, value: null};
    case `booleanliteral`:
    case `numericliteral`:
    case `stringliteral`:
      return {type: `literal`, optional, value: path.value};
    case `intersection`:
    case `tuple`:
    case `union`:
      return {...base, entries: path.types.map(p => typeAST(p))};
    case `nullable`:
      return {...base, value: typeAST(path.typeAnnotation)};
    case `any`:
    case `mixed`:
      return {type: 'garbage', optional};
    // case `void`:
    // case `function`:
    // case `string`:
    // case `number`:
    // case `boolean`:
    default:
      return {...base};
  }
}
