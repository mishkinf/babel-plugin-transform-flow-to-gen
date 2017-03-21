import * as babel from 'babel-core';

export default (str, args) => babel.template(str)(args).expression;
