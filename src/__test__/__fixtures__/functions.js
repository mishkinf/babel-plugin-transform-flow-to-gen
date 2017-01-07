type Person<T> = {
  name: string,
  age: number,
  other: T
}

type Misc = {
  eyeColor: string
};

export function concat(a: string, b: string) {
  return a + b;
}

export function setName(person: Person<Misc>, name: string) {
  return {
    ...person,
    name,
  };
}

// eslint-disable-next-line func-names
export const setNameThenCallback = function (
  person: Person<Misc>,
  name: string,
  callback: (p: Person) => void,
): void {
  const newPerson = {
    ...person,
    name,
  };

  callback(newPerson);
};

export const setNameWithGeneric = <T>(person: Person<T>, name: string) => ({
  ...person,
  name,
});
