const SPECIAL_GENERICS = {
  Array(params) {
    return {type: `array`, elementType: params[0]};
  },
  Object(params) {
    return {type: `object`, members: {}, indexers: []};
  },
  $Gen(params) {
    return {type: `generator`, typeAlias: params[0], caller: params[1].name};
  },
  $Keys(params) {
    return {type: `typeAliasKeys`, typeAlias: params[0]};
  },
  $Shape(params) {
    return {type: `typeAliasShape`, typeAlias: params[0]};
  },
  $Subtype(params) {
    return params[0];
  },
};

export default function typeAST(path, optional = false) {
  const type = path.type.replace(`TypeAnnotation`, ``).toLowerCase();
  const base = {type, optional};

  switch (type) {
    case `generic`: {
      const {typeParameters} = path;
      const name = path.id.name;

      const args =
        (typeParameters && typeParameters.params) ?
          typeParameters.params.map(p => typeAST(p)) :
          [];

      if (Boolean(SPECIAL_GENERICS[name])) {
        return {...SPECIAL_GENERICS[name](args), optional};
      } else {
        return {type: `typeAlias`, optional, name, args};
      }
    }
    case `object`: {
      const members = path.properties.reduce((acc, prop) => {
        const key = prop.key.name;
        const opt = prop.optional;
        const value = typeAST(prop.value, opt);
        return {
          ...acc,
          [key]: value,
        };
      }, {});

      const indexers = path.indexers.reduce((acc, index) => {
        if (index.id.name !== 'key') {
          return acc;
        }

        const indexer = {
          key: typeAST(index.key),
          value: typeAST(index.value)
        };

        return [...acc, indexer];
      }, []);

      return {
        ...base,
        members,
        indexers
      };
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
      return base;
  }
}
