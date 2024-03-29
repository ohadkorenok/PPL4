"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// L5-typecheck
const assert_1 = require("assert");
const L5_typecheck_1 = require("./L5-typecheck");
const TExp_1 = require("./TExp");
// Example:
// var nitzan = typeofExp(parse("(define (x : number) 5)"), makeEmptyTEnv());
var nitzan = TExp_1.parseTE("(number | (number -> boolean) | (number | boolean))");
var bob = TExp_1.unparseTExp(nitzan);
L5_typecheck_1.L5typeof("(number | boolean | number | nitzan ) | shushu");
// var asd = parse("(define (x: number) 3))");
// var asdsad = typeofExp(asd, makeEmptyTEnv());
assert_1.strict.deepEqual(TExp_1.unparseTExp(TExp_1.parseTE("(number | boolean)")), TExp_1.unparseTExp(TExp_1.parseTE("(boolean | number)")));
// assert.deepEqual(L5typeof("(number | boolean)"), L5typeof("(boolean | number)"));
//TODO:: 3b four examples
// TODO:: 3c four examples
