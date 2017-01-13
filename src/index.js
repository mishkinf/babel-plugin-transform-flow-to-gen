import * as types from './typeHelpers';
import sample from './sample';
import asGenerator from './asGenerator';

const sampleOne = gen => sample(gen, 1)[0];

export {default} from './plugin';
export {sample, sampleOne, types, asGenerator};
