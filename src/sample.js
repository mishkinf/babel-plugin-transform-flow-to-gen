import testcheck from 'testcheck';

export function sample(gen, times = 10) {
  return testcheck.sample(gen, {times});
}
