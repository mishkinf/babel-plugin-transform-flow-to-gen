import fs from 'fs';
import path from 'path';
import * as babylon from 'babylon';
import babelTraverse from 'babel-traverse';
import traverse from './traverse';

function parseFixture(fileName, callback) {
  const file = path.join(__dirname, `__fixtures__`, `${fileName}.js`);
  const buf = fs.readFileSync(file);

  const ast = babylon.parse(buf.toString(), {
    sourceType: `module`,
    plugins: [`flow`],
  });

  babelTraverse(ast, {
    TypeAlias: p => {
      callback(traverse(p));
    },
  });
}

describe(`traverse`, () => {
  it(`traverses simple types`, done => {
    parseFixture(`traverse-01`, result => {
      expect(result.name).toEqual(`Person`);
      expect(result.params.length).toEqual(0);
      expect(result.type.type).toEqual(`object`);
      expect(result.type.members.firstName.type).toEqual(`string`);
      expect(result.type.members.firstName.optional).toEqual(false);
      expect(result.type.members.lastName.type).toEqual(`string`);
      expect(result.type.members.lastName.optional).toEqual(true);
      expect(result.type.members.age.type).toEqual(`number`);
      expect(result.type.members.age.optional).toEqual(false);
      done();
    });
  });

  it(`traverses simple types with generics`, done => {
    parseFixture(`traverse-02`, result => {
      expect(result.name).toEqual(`Person`);
      expect(result.params).toEqual([{name: `T`, bound: null}]);
      expect(result.type.type).toEqual(`object`);
      expect(result.type.members.misc.type).toEqual(`generic`);
      expect(result.type.members.misc.name).toEqual(`T`);
      done();
    });
  });

  it(`traverses simple types with subtyped generics`, done => {
    parseFixture(`traverse-03`, result => {
      expect(result.name).toEqual(`Person`);
      expect(result.params.length).toEqual(1);
      expect(result.params[0].name).toEqual(`T`);
      expect(result.params[0].bound.type).toEqual(`string`);
      expect(result.type.type).toEqual(`object`);
      expect(result.type.members.misc.type).toEqual(`generic`);
      expect(result.type.members.misc.name).toEqual(`T`);
      done();
    });
  });

  it(`traverses simple types which reference other types`, done => {
    parseFixture(`traverse-04`, result => {
      expect(result.name).toEqual(`Person`);
      expect(result.type.members.misc.type).toEqual(`generic`);
      expect(result.type.members.misc.name).toEqual(`Info`);
      done();
    });
  });

  it(`traverses simple types passing generics to other referenced types`, done => {
    parseFixture(`traverse-05`, result => {
      expect(result.name).toEqual(`Person`);
      expect(result.params.length).toEqual(1);
      expect(result.params[0].name).toEqual(`T`);
      expect(result.type.members.misc.type).toEqual(`generic`);
      expect(result.type.members.misc.name).toEqual(`Info`);
      expect(result.type.members.misc.args.length).toEqual(1);
      expect(result.type.members.misc.args[0].name).toEqual(`T`);
      done();
    });
  });

  it(`traverses plain value types`, done => {
    parseFixture(`traverse-06`, result => {
      expect(result.name).toEqual(`BigNumber`);
      expect(result.type.type).toEqual(`number`);
      done();
    });
  });

  it(`traverses union types`, done => {
    parseFixture(`traverse-07`, result => {
      expect(result.name).toEqual(`Enum`);
      expect(result.type.type).toEqual(`union`);
      expect(result.type.entries.length).toEqual(3);
      expect(result.type.entries[0].name).toEqual(`A`);
      expect(result.type.entries[1].name).toEqual(`B`);
      expect(result.type.entries[2].name).toEqual(`C`);
      done();
    });
  });

  it(`traverses intersection types`, done => {
    parseFixture(`traverse-08`, result => {
      expect(result.name).toEqual(`Enum`);
      expect(result.type.type).toEqual(`intersection`);
      expect(result.type.entries.length).toEqual(3);
      expect(result.type.entries[0].name).toEqual(`A`);
      expect(result.type.entries[1].name).toEqual(`B`);
      expect(result.type.entries[2].name).toEqual(`C`);
      done();
    });
  });

  it(`traverses union types with string literals`, done => {
    parseFixture(`traverse-09`, result => {
      expect(result.name).toEqual(`Side`);
      expect(result.type.type).toEqual(`union`);
      expect(result.type.entries[0].value).toEqual(`right`);
      expect(result.type.entries[0].type).toEqual(`stringliteral`);
      expect(result.type.entries[1].value).toEqual(`left`);
      expect(result.type.entries[1].type).toEqual(`stringliteral`);
      done();
    });
  });

  it(`tranverses array types`, done => {
    parseFixture(`traverse-10`, result => {
      expect(result.name).toEqual(`Store`);
      expect(result.type.type).toEqual(`object`);
      expect(result.type.members.owners.type).toEqual(`array`);
      expect(result.type.members.owners.elementType.type).toEqual(`generic`);
      expect(result.type.members.owners.elementType.name).toEqual(`Owner`);
      done();
    });
  });
});
