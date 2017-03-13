# Flow to gen

_Transforms Flow annotations into TestCheck generators for randomized testing_

## Motivation

Read [this blog post](https://medium.com/@gabescholz/randomized-testing-in-javascript-without-lifting-a-finger-8d616d7048af)

## Demo?

[DEMO!](https://demo-ywibuugizo.now.sh)

## Installing

```js
yarn add babel-plugin-transform-flow-to-gen
```

and add it to your `.babelrc`

```json
{
  "presets": ["es-2015"],
  "plugins": ["syntax-flow"],
  "env": {
    "development": {
      "plugins": ["strip-flow-types"]
    },
    "test": {
      "plugins": ["flow-to-gen", "strip-flow-types"]
    }
  }
}
```

## License

MIT
