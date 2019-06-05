"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
// ========================================================
// Error handling
exports.isError = (x) => x instanceof Error;
// Type predicate that warrants that an array does not contain errors.
// Needed for safeFL
exports.hasNoError = (x) => ramda_1.filter(exports.isError, x).length === 0;
exports.getErrorMessages = (x) => ramda_1.map((x) => JSON.stringify(x.message), ramda_1.filter(exports.isError, x)).join("\n");
// Make a safe version of f: apply f to x but check if x is an error before applying it.
exports.safeF = (f) => (x) => {
    if (exports.isError(x))
        return x;
    else
        return f(x);
};
// Same as safeF but for a function that accepts an array of values
// NOTE: we must use an annotation of the form Array<T1 | Error> instead of (T1 | Error)[]
// this is a syntactic restriction of TypeScript.
exports.safeFL = (f) => (xs) => exports.hasNoError(xs) ? f(xs) : Error(exports.getErrorMessages(xs));
exports.safeF2 = (f) => (x, y) => exports.isError(x) ? x :
    exports.isError(y) ? y :
        f(x, y);
exports.trust = (x) => exports.isError(x) ? undefined : x;
