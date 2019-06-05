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

// var asd = parse("(define (x: number) 3))");

// var asdsad = typeofExp(asd, makeEmptyTEnv());
assert.deepEqual(unparseTExp(parseTE("(number | boolean)")), unparseTExp(parseTE("(boolean | number)")));
// assert.deepEqual(L5typeof("(number | boolean)"), L5typeof("(boolean | number)"));
//TODO:: 3b four examples
// TODO:: 3c four examples
//TODO:: 1st question Everything

