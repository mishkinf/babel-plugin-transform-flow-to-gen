type Person<T> = {
  name: string,
  age: number,
  other: T
}

type Misc = {
  eyeColor: string
};

export function setName(person: Person<Misc>, name: string) {
  return {
    ...person,
    name
  };
}
