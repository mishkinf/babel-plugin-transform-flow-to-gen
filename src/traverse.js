function getTypeArgs(path) {
  if (!path || !path.params) {
    return [];
  }

  return path.params.map(p => getType(p));
}

function getTypeParams(path) {
  if (!path || !path.params) {
    return [];
  }

  return path.params.map(param => ({
    name: param.name,
    bound: param.bound ? getType(param.bound.typeAnnotation) : null
  }));
}

function getType(path, optional = false) {
  const type = path.type.replace('TypeAnnotation', '').toLowerCase();
  const base = {type, optional};

  switch (type) {
    case 'generic': {
      const name = path.id.name;
      const args = getTypeArgs(path.typeParameters);
      return {...base, name, args};
    }
    case 'object': {
      return path.properties.reduce((acc, prop) => {
        const key = prop.key.name;
        const optional = prop.optional;
        const value = getType(prop.value, optional);
        return {
          ...acc,
          members: {
            ...acc.members,
            [key]: value
          }
        };
      }, {...base, members: {}});
    }
    case 'array': {
      const elements = getType(path.elementType);
      return {...base, elements};
    }
    case 'stringliteral': {
      const value = path.value;
      return {...base, value};
    }
    case 'intersection':
    case 'tuple':
    case 'union': {
      const entries = path.types.map(p => getType(p));
      return {...base, entries};
    }
    case 'nullable':
      const value = getType(path.typeAnnotation);
      return {...base, value};

    // case 'function':
    // case 'string':
    // case 'number':
    // case 'boolean':
    default:
      return {...base};
  }
}

export default function traverse(path) {
  const {node} = path;
  const name = node.id.name;
  const type = getType(node.right);
  const params = getTypeParams(node.typeParameters);

  return {
    name,
    type,
    params
  };
}
