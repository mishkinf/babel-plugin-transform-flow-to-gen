import createTypeAST from './createTypeAST';

function typeParams(path) {
  if (path && path.params) {
    return path.params.map(param => ({
      name: param.name,
      bound: param.bound ? createTypeAST(param.bound.typeAnnotation) : null,
    }));
  }

  return [];
}

export default function traverseType(path) {
  const {node} = path;
  const name = node.id.name;
  const type = createTypeAST(node.right);
  const params = typeParams(node.typeParameters);

  return {
    name,
    type,
    params,
  };
}
