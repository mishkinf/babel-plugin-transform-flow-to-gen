// @flow

import testcheck from 'testcheck';
import {Person} from './Person';
import {Other} from './Other';

const root = document.querySelector('#root');
const json = testcheck.sample(Person(Other()));

root.innerText = JSON.stringify(json, 2, 2);
