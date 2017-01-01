type Person = {
  name: string,
  age: number
}

export function setNameThenCallback(person: Person, name: string, callback: (p: Person) => void): void {
  const newPerson = {
    ...person,
    name
  };

  callback(newPerson);
}
