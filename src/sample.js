import testcheck from 'testcheck';

export default function sample(gen, times = 10) {
  return testcheck.sample(gen, {times});
}
