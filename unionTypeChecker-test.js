"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// L5-typecheck
const assert_1 = require("assert");
const L5_typecheck_1 = require("./L5-typecheck");
const TExp_1 = require("./TExp");
// Example:
// var nitzan = typeofExp(parse("(define (x : number) 5)"), makeEmptyTEnv());
var nitzan = TExp_1.parseTE("((number | | boolean | number | nitzan ) | shushu)");
var bob = TExp_1.unparseTExp(nitzan);
var ohad = "ohad";
L5_typecheck_1.L5typeof("(number | boolean | number | nitzan ) | shushu");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("(number | boolean)"), L5_typecheck_1.L5typeof("(boolean | number)"));