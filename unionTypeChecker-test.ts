// L5-typecheck
import { strict as assert } from 'assert';
import {L5typeof, typeofExp} from './L5-typecheck';
import {parse} from "./L5-ast";
import {makeEmptyTEnv} from "./TEnv";
import {parseTE, unparseTExp} from "./TExp";


// Example:

// var nitzan = typeofExp(parse("(define (x : number) 5)"), makeEmptyTEnv());
var nitzan = parseTE("((number | | boolean | number | nitzan ) | shushu)");
var bob = unparseTExp(nitzan);

L5typeof("(number | boolean | number | nitzan ) | shushu");
assert.deepEqual(L5typeof("(number | boolean)"), L5typeof("(boolean | number)"));

