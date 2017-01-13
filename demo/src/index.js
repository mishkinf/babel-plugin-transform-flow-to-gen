// @flow weak

import {sample} from 'babel-plugin-transform-flow-to-gen/api';
import {Person} from './Person';
import {Other} from './Other';

const root = document.querySelector('#root');
const json = sample(Person(Other()));

root.innerText = JSON.stringify(json, 2, 2);
