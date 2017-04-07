class A<T> {
  constructor() {

  }

  static someStaticMethod(str: string) {
    return `${str}!!!`;
  }

  someMethod(str: string) {
    return `${str}!`;
  }
}

export {A};
