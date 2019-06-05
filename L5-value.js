"use strict";
// ========================================================
// Value type definition for L5
Object.defineProperty(exports, "__esModule", { value: true });
const L5_ast_1 = require("./L5-ast");
exports.isFunctional = (x) => L5_ast_1.isPrimOp(x) || exports.isClosure(x);
;
exports.makeClosure = (params, body, env) => ({ tag: "Closure", params: params, body: body, env: env });
exports.isClosure = (x) => x.tag === "Closure";
;
;
;
exports.isSExp = (x) => typeof (x) === 'string' || typeof (x) === 'boolean' || typeof (x) === 'number' ||
    exports.isSymbolSExp(x) || exports.isCompoundSExp(x) || exports.isEmptySExp(x) || L5_ast_1.isPrimOp(x) || exports.isClosure(x);
exports.makeCompoundSExp = (val) => ({ tag: "CompoundSexp", val: val });
exports.isCompoundSExp = (x) => x.tag === "CompoundSexp";
exports.makeEmptySExp = () => ({ tag: "EmptySExp" });
exports.isEmptySExp = (x) => x.tag === "EmptySExp";
exports.makeSymbolSExp = (val) => ({ tag: "SymbolSExp", val: val });
exports.isSymbolSExp = (x) => x.tag === "SymbolSExp";
