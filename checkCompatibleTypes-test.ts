// L5-typecheck
import { strict as assert } from 'assert';
import { checkCompatibleTypes } from './L5-typecheck';
import {
    makeBoolTExp,
    makeNumTExp,
    makeProcTExp, makeStrTExp,
    makeTVar,
    makeUnionTExp,
    makeVoidTExp,
    parseTE,
    unparseTExp
} from './TExp';


// Comparing 2 atomic types
assert.notDeepEqual(checkCompatibleTypes(makeBoolTExp(), makeNumTExp()),    true);
assert.deepEqual(checkCompatibleTypes(makeBoolTExp(), makeBoolTExp()),   true);
assert.deepEqual(checkCompatibleTypes(makeBoolTExp(), makeUnionTExp([makeNumTExp(), makeBoolTExp()])), true);
assert.notDeepEqual(checkCompatibleTypes(makeStrTExp(), makeUnionTExp([makeNumTExp(), makeBoolTExp()])), true);
assert.notDeepEqual(checkCompatibleTypes(makeStrTExp(), makeProcTExp([makeNumTExp(), makeBoolTExp()], makeBoolTExp())), true);
assert.notDeepEqual(checkCompatibleTypes(makeStrTExp(), makeProcTExp([makeStrTExp(), makeStrTExp()], makeStrTExp())), true);
assert.notDeepEqual(checkCompatibleTypes(makeUnionTExp([makeNumTExp(), makeBoolTExp()]), makeBoolTExp() ), true);



//Union tests
assert.deepEqual(checkCompatibleTypes(makeUnionTExp([makeBoolTExp(), makeNumTExp() ]), makeUnionTExp([makeNumTExp(), makeBoolTExp()])), true);
assert.deepEqual(checkCompatibleTypes(makeUnionTExp([makeNumTExp(), makeBoolTExp(), makeBoolTExp()]), makeUnionTExp([makeNumTExp(), makeBoolTExp()])), true);
assert.notDeepEqual(checkCompatibleTypes(makeUnionTExp([makeNumTExp(), makeStrTExp()]), makeUnionTExp([makeNumTExp(), makeBoolTExp()])), true);
assert.deepEqual(checkCompatibleTypes(makeUnionTExp([makeNumTExp(), makeStrTExp()]), makeUnionTExp([makeNumTExp(), makeBoolTExp(), makeStrTExp()])), true);
assert.deepEqual(checkCompatibleTypes(makeUnionTExp([makeUnionTExp([makeNumTExp(), makeStrTExp()]), makeStrTExp()]), makeUnionTExp([makeNumTExp(), makeBoolTExp(), makeStrTExp()])), true);

// assert.deepEqual(checkCompatibleTypes(makeUnionTExp([makeNumTExp(), makeProcTExp([makeStrTExp(), makeBoolTExp()], makeNumTExp())]),makeNumTExp();
assert.notDeepEqual(checkCompatibleTypes(makeUnionTExp([makeProcTExp([makeBoolTExp(), makeStrTExp()],makeNumTExp())]),makeNumTExp()),true);
assert.notDeepEqual(checkCompatibleTypes(makeUnionTExp([makeProcTExp([makeBoolTExp(), makeStrTExp()],makeNumTExp())]),makeProcTExp([makeBoolTExp(), makeStrTExp()],makeNumTExp())),true);
assert.notDeepEqual(checkCompatibleTypes(makeProcTExp([makeBoolTExp(), makeStrTExp()],makeNumTExp()),makeUnionTExp([makeProcTExp([makeBoolTExp(), makeStrTExp()],makeNumTExp())])),true);



assert.deepEqual(checkCompatibleTypes(makeUnionTExp([makeProcTExp([makeBoolTExp(), makeStrTExp()],makeNumTExp())]),makeUnionTExp([makeProcTExp([makeBoolTExp(), makeStrTExp()],makeNumTExp())])),true);
assert.deepEqual(checkCompatibleTypes(makeUnionTExp([makeNumTExp()]),makeUnionTExp([makeNumTExp(), makeStrTExp(), makeBoolTExp()])),true);
assert.notDeepEqual(checkCompatibleTypes(makeUnionTExp([makeNumTExp(), makeBoolTExp()]),makeUnionTExp([makeNumTExp(), makeStrTExp()])),true);
assert.deepEqual(checkCompatibleTypes(makeUnionTExp([makeStrTExp()]),makeUnionTExp([makeNumTExp(), makeStrTExp(), makeBoolTExp()])),true);



assert.deepEqual(checkCompatibleTypes(makeProcTExp([],makeBoolTExp()),makeProcTExp([],makeBoolTExp())),true);
assert.deepEqual(checkCompatibleTypes(makeProcTExp([],makeVoidTExp()),makeProcTExp([],makeVoidTExp())),true);
assert.deepEqual(checkCompatibleTypes(makeProcTExp([makeBoolTExp(), makeNumTExp(), makeProcTExp([], makeVoidTExp())],makeVoidTExp()),makeProcTExp([makeBoolTExp(), makeNumTExp(), makeProcTExp([], makeVoidTExp())],makeVoidTExp())),true);





assert.notDeepEqual(checkCompatibleTypes(makeProcTExp([],makeStrTExp()),makeProcTExp([],makeBoolTExp())),true);
assert.notDeepEqual(checkCompatibleTypes(makeProcTExp([makeBoolTExp(), makeNumTExp()],makeNumTExp()),makeProcTExp([makeNumTExp(), makeBoolTExp()],makeNumTExp())),true);
assert.notDeepEqual(checkCompatibleTypes(makeProcTExp([makeBoolTExp(), makeNumTExp(), makeBoolTExp()],makeNumTExp()),makeProcTExp([makeBoolTExp(), makeNumTExp()],makeNumTExp())),true);











