"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// L5-typecheck
const assert_1 = require("assert");
const L5_typecheck_1 = require("./L5-typecheck");
const TExp_1 = require("./TExp");
// Comparing 2 atomic types
assert_1.strict.notDeepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeBoolTExp(), TExp_1.makeNumTExp()), true);
assert_1.strict.deepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeBoolTExp(), TExp_1.makeBoolTExp()), true);
assert_1.strict.deepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeBoolTExp(), TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeBoolTExp()])), true);
assert_1.strict.notDeepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeStrTExp(), TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeBoolTExp()])), true);
assert_1.strict.notDeepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeStrTExp(), TExp_1.makeProcTExp([TExp_1.makeNumTExp(), TExp_1.makeBoolTExp()], TExp_1.makeBoolTExp())), true);
assert_1.strict.notDeepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeStrTExp(), TExp_1.makeProcTExp([TExp_1.makeStrTExp(), TExp_1.makeStrTExp()], TExp_1.makeStrTExp())), true);
assert_1.strict.notDeepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeBoolTExp()]), TExp_1.makeBoolTExp()), true);
//Union tests
assert_1.strict.deepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeUnionTExp([TExp_1.makeBoolTExp(), TExp_1.makeNumTExp()]), TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeBoolTExp()])), true);
assert_1.strict.deepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeBoolTExp(), TExp_1.makeBoolTExp()]), TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeBoolTExp()])), true);
assert_1.strict.notDeepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeStrTExp()]), TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeBoolTExp()])), true);
assert_1.strict.deepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeStrTExp()]), TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeBoolTExp(), TExp_1.makeStrTExp()])), true);
assert_1.strict.deepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeUnionTExp([TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeStrTExp()]), TExp_1.makeStrTExp()]), TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeBoolTExp(), TExp_1.makeStrTExp()])), true);
// assert.deepEqual(checkCompatibleTypes(makeUnionTExp([makeNumTExp(), makeProcTExp([makeStrTExp(), makeBoolTExp()], makeNumTExp())]),makeNumTExp();
assert_1.strict.notDeepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeUnionTExp([TExp_1.makeProcTExp([TExp_1.makeBoolTExp(), TExp_1.makeStrTExp()], TExp_1.makeNumTExp())]), TExp_1.makeNumTExp()), true);
assert_1.strict.notDeepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeUnionTExp([TExp_1.makeProcTExp([TExp_1.makeBoolTExp(), TExp_1.makeStrTExp()], TExp_1.makeNumTExp())]), TExp_1.makeProcTExp([TExp_1.makeBoolTExp(), TExp_1.makeStrTExp()], TExp_1.makeNumTExp())), true);
assert_1.strict.notDeepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeProcTExp([TExp_1.makeBoolTExp(), TExp_1.makeStrTExp()], TExp_1.makeNumTExp()), TExp_1.makeUnionTExp([TExp_1.makeProcTExp([TExp_1.makeBoolTExp(), TExp_1.makeStrTExp()], TExp_1.makeNumTExp())])), true);
assert_1.strict.deepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeUnionTExp([TExp_1.makeProcTExp([TExp_1.makeBoolTExp(), TExp_1.makeStrTExp()], TExp_1.makeNumTExp())]), TExp_1.makeUnionTExp([TExp_1.makeProcTExp([TExp_1.makeBoolTExp(), TExp_1.makeStrTExp()], TExp_1.makeNumTExp())])), true);
assert_1.strict.deepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeUnionTExp([TExp_1.makeNumTExp()]), TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeStrTExp(), TExp_1.makeBoolTExp()])), true);
assert_1.strict.notDeepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeBoolTExp()]), TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeStrTExp()])), true);
assert_1.strict.deepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeUnionTExp([TExp_1.makeStrTExp()]), TExp_1.makeUnionTExp([TExp_1.makeNumTExp(), TExp_1.makeStrTExp(), TExp_1.makeBoolTExp()])), true);
assert_1.strict.deepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeProcTExp([], TExp_1.makeBoolTExp()), TExp_1.makeProcTExp([], TExp_1.makeBoolTExp())), true);
assert_1.strict.deepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeProcTExp([], TExp_1.makeVoidTExp()), TExp_1.makeProcTExp([], TExp_1.makeVoidTExp())), true);
assert_1.strict.deepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeProcTExp([TExp_1.makeBoolTExp(), TExp_1.makeNumTExp(), TExp_1.makeProcTExp([], TExp_1.makeVoidTExp())], TExp_1.makeVoidTExp()), TExp_1.makeProcTExp([TExp_1.makeBoolTExp(), TExp_1.makeNumTExp(), TExp_1.makeProcTExp([], TExp_1.makeVoidTExp())], TExp_1.makeVoidTExp())), true);
assert_1.strict.notDeepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeProcTExp([], TExp_1.makeStrTExp()), TExp_1.makeProcTExp([], TExp_1.makeBoolTExp())), true);
assert_1.strict.notDeepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeProcTExp([TExp_1.makeBoolTExp(), TExp_1.makeNumTExp()], TExp_1.makeNumTExp()), TExp_1.makeProcTExp([TExp_1.makeNumTExp(), TExp_1.makeBoolTExp()], TExp_1.makeNumTExp())), true);
assert_1.strict.notDeepEqual(L5_typecheck_1.checkCompatibleTypes(TExp_1.makeProcTExp([TExp_1.makeBoolTExp(), TExp_1.makeNumTExp(), TExp_1.makeBoolTExp()], TExp_1.makeNumTExp()), TExp_1.makeProcTExp([TExp_1.makeBoolTExp(), TExp_1.makeNumTExp()], TExp_1.makeNumTExp())), true);
