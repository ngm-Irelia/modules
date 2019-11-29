import {showBaseMessage} from './testbase.js';

showBaseMessage();

import('./t1.js').then(res=>{ console.log(res.t1)})