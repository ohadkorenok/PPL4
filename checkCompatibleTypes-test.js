"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// L5-typecheck
const assert_1 = require("assert");
const L5_typecheck_1 = require("./L5-typecheck");
const TExp_1 = require("./TExp");
// Comparing 2 atomic types
assert_1.strict.deepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeBoolTExp(), TExp_1.makeNumTExp()), false);
assert_1.strict.deepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeBoolTExp(), TExp_1.makeBoolTExp()), true);
