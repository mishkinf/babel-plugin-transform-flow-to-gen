import testcheck from 'testcheck';

export function sample(gen, times) {
  return testcheck.sample(gen, {times});
}
