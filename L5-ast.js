"use strict";
// ===========================================================
// AST type models for L5
// L5 extends L4 with:
// optional type annotations
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const p = require("s-expression");
const L5_value_1 = require("./L5-value");
const TExp_1 = require("./TExp");
const error_1 = require("./error");
const list_1 = require("./list");
exports.isExp = (x) => exports.isDefineExp(x) || exports.isCExp(x);
exports.isCExp = (x) => exports.isAtomicExp(x) || exports.isCompoundExp(x);
exports.isAtomicExp = (x) => exports.isNumExp(x) || exports.isBoolExp(x) || exports.isStrExp(x) ||
    exports.isPrimOp(x) || exports.isVarRef(x);
exports.isCompoundExp = (x) => exports.isAppExp(x) || exports.isIfExp(x) || exports.isProcExp(x) || exports.isLitExp(x) || exports.isLetExp(x) || exports.isLetrecExp(x) || exports.isSetExp(x);
exports.expComponents = (e) => exports.isIfExp(e) ? [e.test, e.then, e.alt] :
    exports.isProcExp(e) ? e.body :
        exports.isLetExp(e) ? [...e.body, ...ramda_1.map((b) => b.val, e.bindings)] :
            exports.isLetrecExp(e) ? [...e.body, ...ramda_1.map((b) => b.val, e.bindings)] :
                exports.isAppExp(e) ? [e.rator, ...e.rands] :
                    exports.isSetExp(e) ? [e.val] :
                        exports.isDefineExp(e) ? [e.val] :
                            []; // Atomic expressions have no components
;
exports.makeProgram = (exps) => ({ tag: "Program", exps: exps });
exports.isProgram = (x) => x.tag === "Program";
;
exports.makeDefineExp = (v, val) => ({ tag: "DefineExp", var: v, val: val });
exports.isDefineExp = (x) => x.tag === "DefineExp";
;
exports.makeNumExp = (n) => ({ tag: "NumExp", val: n });
exports.isNumExp = (x) => x.tag === "NumExp";
;
exports.makeBoolExp = (b) => ({ tag: "BoolExp", val: b });
exports.isBoolExp = (x) => x.tag === "BoolExp";
;
exports.makeStrExp = (s) => ({ tag: "StrExp", val: s });
exports.isStrExp = (x) => x.tag === "StrExp";
;
exports.makePrimOp = (op) => ({ tag: "PrimOp", op: op });
exports.isPrimOp = (x) => x.tag === "PrimOp";
;
exports.makeVarRef = (v) => ({ tag: "VarRef", var: v });
exports.isVarRef = (x) => x.tag === "VarRef";
;
exports.makeVarDecl = (v, te) => ({ tag: "VarDecl", var: v, texp: te });
exports.isVarDecl = (x) => x.tag === "VarDecl";
;
exports.makeAppExp = (rator, rands) => ({ tag: "AppExp", rator: rator, rands: rands });
exports.isAppExp = (x) => x.tag === "AppExp";
;
exports.makeIfExp = (test, then, alt) => ({ tag: "IfExp", test: test, then: then, alt: alt });
exports.isIfExp = (x) => x.tag === "IfExp";
;
exports.makeProcExp = (args, body, returnTE) => ({ tag: "ProcExp", args: args, body: body, returnTE: returnTE });
exports.isProcExp = (x) => x.tag === "ProcExp";
;
exports.makeBinding = (v, val) => ({ tag: "Binding", var: v, val: val });
exports.isBinding = (x) => x.tag === "Binding";
;
exports.makeLetExp = (bindings, body) => ({ tag: "LetExp", bindings: bindings, body: body });
exports.isLetExp = (x) => x.tag === "LetExp";
;
exports.makeLitExp = (val) => ({ tag: "LitExp", val: val });
exports.isLitExp = (x) => x.tag === "LitExp";
;
exports.makeLetrecExp = (bindings, body) => ({ tag: "LetrecExp", bindings: bindings, body: body });
exports.isLetrecExp = (x) => x.tag === "LetrecExp";
;
exports.makeSetExp = (v, val) => ({ tag: "SetExp", var: v, val: val });
exports.isSetExp = (x) => x.tag === "SetExp";
// ========================================================
// Parsing utilities
exports.isEmpty = (x) => x.length === 0;
exports.isArray = (x) => x instanceof Array;
exports.isString = (x) => typeof x === "string";
exports.isNumber = (x) => typeof x === "number";
exports.isBoolean = (x) => typeof x === "boolean";
// s-expression returns strings quoted as "a" as [String: 'a'] objects
// to distinguish them from symbols - which are encoded as 'a'
// These are constructed using the new String("a") constructor
// and can be distinguished from regular strings based on the constructor.
exports.isSexpString = (x) => !exports.isString(x) && x.constructor && x.constructor.name === "String";
// A weird method to check that a string is a string encoding of a number
exports.isNumericString = (x) => JSON.stringify(+x) === x;
// ========================================================
// Parsing
exports.parse = (x) => exports.parseSexp(p(x));
exports.parseSexp = (sexp) => exports.isEmpty(sexp) ? Error("Parse: Unexpected empty") :
    exports.isArray(sexp) ? parseCompound(sexp) :
        exports.isString(sexp) ? exports.parseAtomic(sexp) :
            exports.isSexpString(sexp) ? exports.parseAtomic(sexp) :
                Error(`Parse: Unexpected type ${sexp}`);
exports.parseAtomic = (sexp) => sexp === "#t" ? exports.makeBoolExp(true) :
    sexp === "#f" ? exports.makeBoolExp(false) :
        exports.isNumericString(sexp) ? exports.makeNumExp(+sexp) :
            exports.isSexpString(sexp) ? exports.makeStrExp(sexp.toString()) :
                isPrimitiveOp(sexp) ? exports.makePrimOp(sexp) :
                    exports.makeVarRef(sexp);
/*
    // <prim-op>  ::= + | - | * | / | < | > | = | not |  eq? | string=?
    //                  | cons | car | cdr | list? | number?
    //                  | boolean? | symbol? | string?
*/
const isPrimitiveOp = (x) => x === "+" ||
    x === "-" ||
    x === "*" ||
    x === "/" ||
    x === ">" ||
    x === "<" ||
    x === "=" ||
    x === "not" ||
    x === "eq?" ||
    x === "string=?" ||
    x === "cons" ||
    x === "car" ||
    x === "cdr" ||
    x === "list?" ||
    x === "number?" ||
    x === "boolean?" ||
    x === "symbol?" ||
    x === "string?" ||
    x === "display" ||
    x === "newline";
const parseCompound = (sexps) => exports.isEmpty(sexps) ? Error("Unexpected empty sexp") :
    (list_1.first(sexps) === "L5") ? parseProgram(ramda_1.map(exports.parseSexp, list_1.rest(sexps))) :
        (list_1.first(sexps) === "define") ? parseDefine(list_1.rest(sexps)) :
            exports.parseCExp(sexps);
const parseProgram = (es) => exports.isEmpty(es) ? Error("Empty program") :
    list_1.allT(exports.isExp, es) ? exports.makeProgram(es) :
        error_1.hasNoError(es) ? Error(`Program cannot be embedded in another program - ${es}`) :
            Error(error_1.getErrorMessages(es));
const safeMakeDefineExp = (vd, val) => error_1.isError(vd) ? vd :
    error_1.isError(val) ? val :
        exports.makeDefineExp(vd, val);
const parseDefine = (es) => (es.length !== 2) ? Error(`define should be (define var val) - ${es}`) :
    !isConcreteVarDecl(es[0]) ? Error(`Expected (define <VarDecl> <CExp>) - ${es[0]}`) :
        safeMakeDefineExp(exports.parseVarDecl(es[0]), exports.parseCExp(es[1]));
exports.parseCExp = (sexp) => exports.isArray(sexp) ? parseCompoundCExp(sexp) :
    exports.isString(sexp) ? exports.parseAtomic(sexp) :
        exports.isSexpString(sexp) ? exports.parseAtomic(sexp) :
            Error("Unexpected type" + sexp);
const parseCompoundCExp = (sexps) => exports.isEmpty(sexps) ? Error("Unexpected empty") :
    list_1.first(sexps) === "if" ? parseIfExp(sexps) :
        list_1.first(sexps) === "lambda" ? parseProcExp(sexps) :
            list_1.first(sexps) === "let" ? parseLetExp(sexps) :
                list_1.first(sexps) === "letrec" ? parseLetrecExp(sexps) :
                    list_1.first(sexps) === "set!" ? parseSetExp(sexps) :
                        list_1.first(sexps) === "quote" ? exports.parseLitExp(sexps) :
                            parseAppExp(sexps);
const parseAppExp = (sexps) => error_1.safeFL((cexps) => exports.makeAppExp(list_1.first(cexps), list_1.rest(cexps)))(ramda_1.map(exports.parseCExp, sexps));
const parseIfExp = (sexps) => error_1.safeFL((cexps) => exports.makeIfExp(cexps[0], cexps[1], cexps[2]))(ramda_1.map(exports.parseCExp, list_1.rest(sexps)));
// (lambda (<vardecl>*) [: returnTE]? <CExp>+)
const parseProcExp = (sexps) => {
    const args = ramda_1.map(exports.parseVarDecl, sexps[1]);
    const returnTE = (sexps[2] === ":") ? TExp_1.parseTExp(sexps[3]) : TExp_1.makeFreshTVar();
    const body = ramda_1.map(exports.parseCExp, (sexps[2] === ":") ? sexps.slice(4) : sexps.slice(2));
    if (!error_1.hasNoError(args))
        return Error(error_1.getErrorMessages(args));
    else if (!error_1.hasNoError(body))
        return Error(error_1.getErrorMessages(body));
    else if (error_1.isError(returnTE))
        return Error(`Bad return type: ${returnTE}`);
    else
        return exports.makeProcExp(args, body, returnTE);
};
// LetExp ::= (let (<binding>*) <cexp>+)
const parseLetExp = (sexps) => sexps.length < 3 ? Error(`Expected (let (<binding>*) <cexp>+) - ${sexps}`) :
    safeMakeLetExp(parseBindings(sexps[1]), ramda_1.map(exports.parseCExp, sexps.slice(2)));
const safeMakeLetExp = (bindings, body) => error_1.isError(bindings) ? bindings :
    error_1.hasNoError(body) ? exports.makeLetExp(bindings, body) :
        Error(error_1.getErrorMessages(body));
const isConcreteVarDecl = (sexp) => exports.isString(sexp) ||
    (exports.isArray(sexp) && sexp.length > 2 && exports.isString(sexp[0]) && (sexp[1] === ':'));
const safeMakeVarDecl = (v, te) => error_1.isError(te) ? te :
    exports.makeVarDecl(v, te);
exports.parseVarDecl = (x) => exports.isString(x) ? exports.makeVarDecl(x, TExp_1.makeFreshTVar()) :
    safeMakeVarDecl(x[0], TExp_1.parseTExp(x[2]));
exports.parseDecls = (sexps) => ramda_1.map(exports.parseVarDecl, sexps);
const parseBindings = (pairs) => safeMakeBindings(exports.parseDecls(ramda_1.map(list_1.first, pairs)), ramda_1.map(exports.parseCExp, ramda_1.map(list_1.second, pairs)));
const safeMakeBindings = (decls, vals) => (error_1.hasNoError(vals) && error_1.hasNoError(decls)) ? ramda_1.zipWith(exports.makeBinding, decls, vals) :
    !error_1.hasNoError(vals) ? Error(error_1.getErrorMessages(vals)) :
        Error(error_1.getErrorMessages(decls));
// LetrecExp ::= (letrec (<binding>*) <cexp>+)
const parseLetrecExp = (sexps) => sexps.length < 3 ? Error(`Expected (letrec (<binding>*) <cexp>+) - ${sexps}`) :
    safeMakeLetrecExp(parseBindings(sexps[1]), ramda_1.map(exports.parseCExp, sexps.slice(2)));
const safeMakeLetrecExp = (bindings, body) => error_1.isError(bindings) ? bindings :
    error_1.hasNoError(body) ? exports.makeLetrecExp(bindings, body) :
        Error(error_1.getErrorMessages(body));
const parseSetExp = (es) => (es.length !== 3) ? Error(`set! should be (set! var val) - ${es}`) :
    !exports.isString(es[1]) ? Error(`Expected (set! <var> <CExp>) - ${es[1]}`) :
        error_1.safeF((val) => exports.makeSetExp(exports.makeVarRef(es[1]), val))(exports.parseCExp(es[2]));
exports.parseLitExp = (sexps) => error_1.safeF(exports.makeLitExp)(exports.parseSExp(list_1.second(sexps)));
// x is the output of p (sexp parser)
exports.parseSExp = (x) => x === "#t" ? true :
    x === "#f" ? false :
        exports.isNumericString(x) ? +x :
            exports.isSexpString(x) ? x.toString() :
                exports.isString(x) ? L5_value_1.makeSymbolSExp(x) :
                    x.length === 0 ? L5_value_1.makeEmptySExp() :
                        exports.isArray(x) ? error_1.safeFL(L5_value_1.makeCompoundSExp)(ramda_1.map(exports.parseSExp, x)) :
                            Error(`Bad literal expression: ${x}`);
exports.unparse = (e) => error_1.isError(e) ? e :
    // NumExp | StrExp | BoolExp | PrimOp | VarRef
    exports.isNumExp(e) ? `${e.val}` :
        exports.isStrExp(e) ? `"${e.val}"` :
            exports.isBoolExp(e) ? (e.val ? "#t" : "#f") :
                exports.isPrimOp(e) ? e.op :
                    exports.isVarRef(e) ? e.var :
                        // AppExp | IfExp | ProcExp | LetExp | LitExp | LetrecExp | SetExp
                        exports.isAppExp(e) ? `(${exports.unparse(e.rator)} ${ramda_1.map(exports.unparse, e.rands).join(" ")})` :
                            exports.isIfExp(e) ? `(if ${exports.unparse(e.test)} ${exports.unparse(e.then)} ${exports.unparse(e.alt)})` :
                                exports.isLetExp(e) ? `(let (${unparseBinding(e.bindings)}) ${ramda_1.map(exports.unparse, e.body).join(" ")})` :
                                    exports.isLetrecExp(e) ? `(letrec (${unparseBinding(e.bindings)}) ${ramda_1.map(exports.unparse, e.body).join(" ")})` :
                                        exports.isProcExp(e) ? `(lambda (${ramda_1.map(unparseVarDecl, e.args).join(" ")})${unparseReturn(e.returnTE)} ${ramda_1.map(exports.unparse, e.body).join(" ")})` :
                                            exports.isLitExp(e) ? `'${unparseSExp(e.val)}` :
                                                exports.isSetExp(e) ? `(set! ${e.var} ${exports.unparse(e.val)})` :
                                                    // DefineExp | Program
                                                    exports.isDefineExp(e) ? `(define ${unparseVarDecl(e.var)} ${exports.unparse(e.val)})` :
                                                        `(L5 ${ramda_1.map(exports.unparse, e.exps)})`;
const unparseReturn = (te) => TExp_1.isTVar(te) ? "" :
    ` : ${TExp_1.unparseTExp(te)}`;
const unparseBinding = (bindings) => ramda_1.map((b) => `(${unparseVarDecl(b.var)} ${exports.unparse(b.val)})`, bindings).join(" ");
const unparseVarDecl = (vd) => TExp_1.isTVar(vd.texp) ? vd.var :
    `(${vd.var} : ${TExp_1.unparseTExp(vd.texp)})`;
//  number | boolean | string | PrimOp | Closure | SymbolSExp | EmptySExp | CompoundSExp
const unparseSExp = (s) => L5_value_1.isEmptySExp(s) ? `()` :
    L5_value_1.isSymbolSExp(s) ? s.val :
        L5_value_1.isCompoundSExp(s) ? `(${ramda_1.map(unparseSExp, s.val).join(" ")})` :
            L5_value_1.isClosure(s) ? `(#Closure)` :
                exports.isPrimOp(s) ? s.op :
                    exports.isBoolean(s) ? (s ? "#t" : "#f") :
                        `${s}`;
