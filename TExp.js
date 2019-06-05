"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
;; TExp AST
;; ========
;; Type checking language
;; Syntax with optional type annotations for var declarations and function return types.

;; Type language
;; <texp>         ::= <atomic-te> | <compound-te> | <tvar>
;; <atomic-te>    ::= <num-te> | <bool-te> | <void-te>
;; <num-te>       ::= number   // num-te()
;; <bool-te>      ::= boolean  // bool-te()
;; <str-te>       ::= string   // str-te()
;; <void-te>      ::= void     // void-te()
;; <compound-te>  ::= <proc-te> | <tuple-te>
;; <non-tuple-te> ::= <atomic-te> | <proc-te> | <tvar>
;; <proc-te>      ::= [ <tuple-te> -> <non-tuple-te> ] // proc-te(param-tes: list(te), return-te: te)
;; <tuple-te>     ::= <non-empty-tuple-te> | <empty-te>
;; <non-empty-tuple-te> ::= ( <non-tuple-te> *)* <non-tuple-te> // tuple-te(tes: list(te))
;; <empty-te>     ::= Empty
;; <tvar>         ::= a symbol starting with T // tvar(id: Symbol, contents; Box(string|boolean))

;; Examples of type expressions
;; number
;; boolean
;; void
;; [number -> boolean]
;; [number * number -> boolean]
;; [number -> [number -> boolean]]
;; [Empty -> number]
;; [Empty -> void]
*/
const ramda_1 = require("ramda");
const p = require("s-expression");
const L5_ast_1 = require("./L5-ast");
const box_1 = require("./box");
const error_1 = require("./error");
const list_1 = require("./list");
exports.isTExp = (x) => exports.isAtomicTExp(x) || exports.isCompoundTExp(x) || exports.isTVar(x);
exports.isAtomicTExp = (x) => exports.isNumTExp(x) || exports.isBoolTExp(x) || exports.isStrTExp(x) || exports.isVoidTExp(x);
exports.isCompoundTExp = (x) => exports.isProcTExp(x) || exports.isTupleTExp(x) || exports.isUnionTExp(x);
exports.isNonTupleTExp = (x) => exports.isAtomicTExp(x) || exports.isProcTExp(x) || exports.isTVar(x);
const sortMe = (texpList) => {
    return texpList.sort((a, b) => a.tag < b.tag ? -1 : a.tag === b.tag ? 0 : 1);
};
exports.makeUnionTExp = (typeList) => ({ tag: "UnionTExp", params: sortMe(typeList) });
exports.isUnionTExp = (x) => x.tag === "UnionTExp";
exports.makeNumTExp = () => ({ tag: "NumTExp" });
exports.isNumTExp = (x) => x.tag === "NumTExp";
exports.makeBoolTExp = () => ({ tag: "BoolTExp" });
exports.isBoolTExp = (x) => x.tag === "BoolTExp";
exports.makeStrTExp = () => ({ tag: "StrTExp" });
exports.isStrTExp = (x) => x.tag === "StrTExp";
exports.makeVoidTExp = () => ({ tag: "VoidTExp" });
exports.isVoidTExp = (x) => x.tag === "VoidTExp";
exports.makeProcTExp = (paramTEs, returnTE) => ({ tag: "ProcTExp", paramTEs: paramTEs, returnTE: returnTE });
exports.isProcTExp = (x) => x.tag === "ProcTExp";
// Uniform access to all components of a ProcTExp
exports.procTExpComponents = (pt) => [...pt.paramTEs, pt.returnTE];
exports.isTupleTExp = (x) => exports.isNonEmptyTupleTExp(x) || exports.isEmptyTupleTExp(x);
;
exports.makeEmptyTupleTExp = () => ({ tag: "EmptyTupleTExp" });
exports.isEmptyTupleTExp = (x) => x.tag === "EmptyTupleTExp";
;
exports.makeNonEmptyTupleTExp = (tes) => ({ tag: "NonEmptyTupleTExp", TEs: tes });
exports.isNonEmptyTupleTExp = (x) => x.tag === "NonEmptyTupleTExp";
exports.isEmptyTVar = (x) => (x.tag === "TVar") && box_1.unbox(x.contents) === undefined;
exports.makeTVar = (v) => ({ tag: "TVar", var: v, contents: box_1.makeBox(undefined) });
const makeTVarGen = () => {
    let count = 0;
    return () => {
        count++;
        return exports.makeTVar(`T_${count}`);
    };
};
exports.makeFreshTVar = makeTVarGen();
exports.isTVar = (x) => x.tag === "TVar";
exports.eqTVar = (tv1, tv2) => tv1.var === tv2.var;
exports.tvarContents = (tv) => box_1.unbox(tv.contents);
exports.tvarSetContents = (tv, val) => box_1.setBox(tv.contents, val);
exports.tvarIsNonEmpty = (tv) => exports.tvarContents(tv) !== undefined;
exports.tvarDeref = (te) => {
    if (!exports.isTVar(te))
        return te;
    const contents = exports.tvarContents(te);
    if (contents === undefined)
        return te;
    else if (exports.isTVar(contents))
        return exports.tvarDeref(contents);
    else
        return contents;
};
// ========================================================
// TExp Utilities
// Purpose: uniform access to atomic types
exports.atomicTExpName = (te) => te.tag;
exports.eqAtomicTExp = (te1, te2) => exports.atomicTExpName(te1) === exports.atomicTExpName(te2);
// ========================================================
// TExp parser
exports.parseTE = (t) => exports.parseTExp(p(t));
/*
;; Purpose: Parse a type expression
;; Type: [SExp -> TEx[]]
;; Example:
;; parseTExp("number") => 'num-te
;; parseTExp('boolean') => 'bool-te
;; parseTExp('T1') => '(tvar T1)
;; parseTExp('(T * T -> boolean)') => '(proc-te ((tvar T) (tvar T)) bool-te)
;; parseTExp('(number -> (number -> number)') => '(proc-te (num-te) (proc-te (num-te) num-te))
*/
exports.parseTExp = (texp) => (texp === "number") ? exports.makeNumTExp() :
    (texp === "boolean") ? exports.makeBoolTExp() :
        (texp === "void") ? exports.makeVoidTExp() :
            (texp === "string") ? exports.makeStrTExp() :
                L5_ast_1.isString(texp) ? exports.makeTVar(texp) :
                    L5_ast_1.isArray(texp) ? parseCompoundTExp(texp) :
                        Error(`Unexpected TExp - ${texp}`);
const flat = (arr) => {
    return ramda_1.reduce((acc, curr) => L5_ast_1.isArray(curr) ? acc.concat(curr) : acc.concat([curr]), [], arr);
};
const validateNoError = (x) => {
    return ramda_1.reduce((acc, curr) => error_1.isError(curr) || acc, false, x) ? Error("One of the variables has an error") : x;
};
const parseUnionTExp = (texp) => {
    let arrayTExpError = ramda_1.map((x) => exports.parseTExp(x), ramda_1.uniq(ramda_1.filter((x) => x !== '|', flat(texp))));
    let booboo = validateNoError(arrayTExpError);
    return error_1.isError(booboo) ? booboo : exports.makeUnionTExp(booboo);
};
/*
;; expected structure: (<params> -> <returnte>)
;; expected exactly one -> in the list
;; We do not accept (a -> b -> c) - must parenthesize
*/
const parseCompoundTExp = (texps) => {
    const pos = texps.indexOf('->');
    const posi = texps.indexOf('|');
    return (posi !== -1) ? parseUnionTExp(texps) : (pos === -1) ? Error(`Procedure type expression without -> - ${texps}`) :
        (pos === 0) ? Error(`No param types in proc texp - ${texps}`) :
            (pos === texps.length - 1) ? Error(`No return type in proc texp - ${texps}`) :
                (texps.slice(pos + 1).indexOf('->') > -1) ? Error(`Only one -> allowed in a procexp - ${texps}`) :
                    safeMakeProcTExp(parseTupleTExp(texps.slice(0, pos)), exports.parseTExp(texps[pos + 1]));
};
const safeMakeProcTExp = (args, returnTE) => error_1.isError(returnTE) ? returnTE :
    error_1.hasNoError(args) ? exports.makeProcTExp(args, returnTE) :
        Error(error_1.getErrorMessages(args));
/*
;; Expected structure: <te1> [* <te2> ... * <ten>]?
;; Or: Empty
*/
const parseTupleTExp = (texps) => {
    const isEmptyTuple = (x) => (x.length === 1) && (x[0] === 'Empty');
    // [x1 * x2 * ... * xn] => [x1,...,xn]
    const splitEvenOdds = (x) => L5_ast_1.isEmpty(x) ? [] :
        L5_ast_1.isEmpty(list_1.rest(x)) ? x :
            (x[1] !== '*') ? [Error(`Parameters of procedure type must be separated by '*': ${texps}`)] :
                [x[0], ...splitEvenOdds(x.splice(2))];
    if (isEmptyTuple(texps))
        return [];
    else {
        const argTEs = splitEvenOdds(texps);
        if (error_1.hasNoError(argTEs))
            return ramda_1.map(exports.parseTExp, argTEs);
        else
            return ramda_1.filter(error_1.isError, argTEs);
    }
};
const unparseArrayNoError = (x) => {
    return L5_ast_1.isEmpty(ramda_1.filter(error_1.isError, x)) ? x.join(" | ") : Error("Error occoured!");
};
/*
;; Purpose: Unparse a type expression Texp into its concrete form
*/
exports.unparseTExp = (te) => {
    const unparseTuple = (paramTes) => L5_ast_1.isEmpty(paramTes) ? ["Empty"] :
        [exports.unparseTExp(paramTes[0]), ...ramda_1.chain((te) => ['*', exports.unparseTExp(te)], list_1.rest(paramTes))];
    const up = (x) => error_1.isError(x) ? x :
        exports.isNumTExp(x) ? 'number' :
            exports.isBoolTExp(x) ? 'boolean' :
                exports.isStrTExp(x) ? 'string' :
                    exports.isVoidTExp(x) ? 'void' :
                        exports.isEmptyTVar(x) ? x.var :
                            exports.isTVar(x) ? up(exports.tvarContents(x)) :
                                exports.isProcTExp(x) ? [...unparseTuple(x.paramTEs), '->', exports.unparseTExp(x.returnTE)] :
                                    exports.isUnionTExp(x) ? unparseArrayNoError(ramda_1.map((y) => exports.unparseTExp(y), x.params)) :
                                        ["never"];
    const unparsed = up(te);
    return L5_ast_1.isString(unparsed) ? unparsed :
        error_1.isError(unparsed) ? unparsed :
            L5_ast_1.isArray(unparsed) ? `(${unparsed.join(' ')})` :
                `Error ${unparsed}`;
};
const matchTVarsInTE = (te1, te2, succ, fail) => (exports.isTVar(te1) || exports.isTVar(te2)) ? matchTVarsinTVars(exports.tvarDeref(te1), exports.tvarDeref(te2), succ, fail) :
    (exports.isAtomicTExp(te1) || exports.isAtomicTExp(te2)) ?
        ((exports.isAtomicTExp(te1) && exports.isAtomicTExp(te2) && exports.eqAtomicTExp(te1, te2)) ? succ([]) : fail()) :
        matchTVarsInTProcs(te1, te2, succ, fail);
// te1 and te2 are the result of tvarDeref
const matchTVarsinTVars = (te1, te2, succ, fail) => (exports.isTVar(te1) && exports.isTVar(te2)) ? (exports.eqTVar(te1, te2) ? succ([]) : succ([{ left: te1, right: te2 }])) :
    (exports.isTVar(te1) || exports.isTVar(te2)) ? fail() :
        matchTVarsInTE(te1, te2, succ, fail);
const matchTVarsInTProcs = (te1, te2, succ, fail) => (exports.isProcTExp(te1) && exports.isProcTExp(te2)) ? matchTVarsInTEs(exports.procTExpComponents(te1), exports.procTExpComponents(te2), succ, fail) :
    fail();
const matchTVarsInTEs = (te1, te2, succ, fail) => (L5_ast_1.isEmpty(te1) && L5_ast_1.isEmpty(te2)) ? succ([]) :
    (L5_ast_1.isEmpty(te1) || L5_ast_1.isEmpty(te2)) ? fail() :
        // Match first then continue on rest
        matchTVarsInTE(list_1.first(te1), list_1.first(te2), (subFirst) => matchTVarsInTEs(list_1.rest(te1), list_1.rest(te2), (subRest) => succ(ramda_1.concat(subFirst, subRest)), fail), fail);
// Signature: equivalent-tes?(te1, te2)
// Purpose:   Check whether 2 type expressions are equivalent up to
//            type variable renaming.
// Example:  equivalentTEs(parseTExp('(T1 * (Number -> T2) -> T3))',
//                         parseTExp('(T4 * (Number -> T5) -> T6))') => #t
exports.equivalentTEs = (te1, te2) => {
    // console.log(`EqTEs ${JSON.stringify(te1)} - ${JSON.stringify(te2)}`);
    const tvarsPairs = matchTVarsInTE(te1, te2, (x) => x, () => false);
    // console.log(`EqTEs pairs = ${map(JSON.stringify, tvarsPairs)}`)
    if (L5_ast_1.isBoolean(tvarsPairs))
        return false;
    else {
        const uniquePairs = ramda_1.uniq(tvarsPairs);
        return (ramda_1.uniq(ramda_1.map((p) => p.left.var, tvarsPairs)).length === ramda_1.uniq(ramda_1.map((p) => p.right.var, tvarsPairs)).length);
    }
};
