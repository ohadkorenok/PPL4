"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// L5-typecheck
// ========================================================
const deepEqual = require("deep-equal");
const ramda_1 = require("ramda");
const L5_ast_1 = require("./L5-ast");
const TEnv_1 = require("./TEnv");
// import { isEmpty, isLetrecExp, isLitExp, isStrExp, BoolExp } from "./L5-ast";
const TExp_1 = require("./TExp");
const error_1 = require("./error");
const list_1 = require("./list");
// Purpose: Check that type expressions are equivalent
// as part of a fully-annotated type check process of exp.
// Return an error if the types are different - true otherwise.
// Exp is only passed for documentation purposes.
const checkEqualType = (te1, te2, exp) => error_1.isError(te1) ? te1 :
    error_1.isError(te2) ? te2 :
        deepEqual(te1, te2) ||
            Error(`Incompatible types: ${TExp_1.unparseTExp(te1)} and ${TExp_1.unparseTExp(te2)} in ${L5_ast_1.unparse(exp)}`);
// const checkCompatibleTypes = (te1: TExp | Error, te2: TExp | Error): true | Error =>
// Compute the type of L5 AST exps to TE
// ===============================================
// Compute a Typed-L5 AST exp to a Texp on the basis
// of its structure and the annotations it contains.
// Purpose: Compute the type of a concrete fully-typed expression
exports.L5typeof = (concreteExp) => TExp_1.unparseTExp(exports.typeofExp(L5_ast_1.parse(concreteExp), TEnv_1.makeEmptyTEnv()));
// Purpose: Compute the type of an expression
// Traverse the AST and check the type according to the exp type.
// We assume that all variables and procedures have been explicitly typed in the program.
exports.typeofExp = (exp, tenv) => L5_ast_1.isNumExp(exp) ? exports.typeofNum(exp) :
    L5_ast_1.isBoolExp(exp) ? exports.typeofBool(exp) :
        L5_ast_1.isStrExp(exp) ? typeofStr(exp) :
            L5_ast_1.isPrimOp(exp) ? exports.typeofPrim(exp) :
                L5_ast_1.isVarRef(exp) ? TEnv_1.applyTEnv(tenv, exp.var) :
                    L5_ast_1.isIfExp(exp) ? exports.typeofIf(exp, tenv) :
                        L5_ast_1.isProcExp(exp) ? exports.typeofProc(exp, tenv) :
                            L5_ast_1.isAppExp(exp) ? exports.typeofApp(exp, tenv) :
                                L5_ast_1.isLetExp(exp) ? exports.typeofLet(exp, tenv) :
                                    L5_ast_1.isLetrecExp(exp) ? exports.typeofLetrec(exp, tenv) :
                                        L5_ast_1.isDefineExp(exp) ? exports.typeofDefine(exp, tenv) :
                                            L5_ast_1.isProgram(exp) ? exports.typeofProgram(exp, tenv) :
                                                // Skip isSetExp(exp) isLitExp(exp)
                                                Error("Unknown type");
// Purpose: Compute the type of a sequence of expressions
// Check all the exps in a sequence - return type of last.
// Pre-conditions: exps is not empty.
exports.typeofExps = (exps, tenv) => L5_ast_1.isEmpty(list_1.rest(exps)) ? exports.typeofExp(list_1.first(exps), tenv) :
    error_1.isError(exports.typeofExp(list_1.first(exps), tenv)) ? exports.typeofExp(list_1.first(exps), tenv) :
        exports.typeofExps(list_1.rest(exps), tenv);
// a number literal has type num-te
exports.typeofNum = (n) => TExp_1.makeNumTExp();
// a boolean literal has type bool-te
exports.typeofBool = (b) => TExp_1.makeBoolTExp();
// a string literal has type str-te
const typeofStr = (s) => TExp_1.makeStrTExp();
// primitive ops have known proc-te types
const numOpTExp = TExp_1.parseTE('(number * number -> number)');
const numCompTExp = TExp_1.parseTE('(number * number -> boolean)');
const boolOpTExp = TExp_1.parseTE('(boolean * boolean -> boolean)');
const typePredTExp = TExp_1.parseTE('(T -> boolean)');
// cons, car, cdr are not covered in this version
exports.typeofPrim = (p) => ['+', '-', '*', '/'].includes(p.op) ? numOpTExp :
    ['and', 'or'].includes(p.op) ? boolOpTExp :
        ['>', '<', '='].includes(p.op) ? numCompTExp :
            ['number?', 'boolean?', 'string?', 'symbol?', 'list?'].includes(p.op) ? typePredTExp :
                (p.op === 'not') ? TExp_1.parseTE('(boolean -> boolean)') :
                    (p.op === 'eq?') ? TExp_1.parseTE('(T1 * T2 -> boolean)') :
                        (p.op === 'string=?') ? TExp_1.parseTE('(T1 * T2 -> boolean)') :
                            (p.op === 'display') ? TExp_1.parseTE('(T -> void)') :
                                (p.op === 'newline') ? TExp_1.parseTE('(Empty -> void)') :
                                    Error(`Unknown primitive ${p.op}`);
// Purpose: compute the type of an if-exp
// Typing rule:
//   if type<test>(tenv) = boolean
//      type<then>(tenv) = t1
//      type<else>(tenv) = t1
// then type<(if test then else)>(tenv) = t1
exports.typeofIf = (ifExp, tenv) => {
    const testTE = exports.typeofExp(ifExp.test, tenv);
    const thenTE = exports.typeofExp(ifExp.then, tenv);
    const altTE = exports.typeofExp(ifExp.alt, tenv);
    if (error_1.isError(testTE))
        return testTE;
    const constraint1 = exports.checkCompatibleTypes(testTE, TExp_1.makeBoolTExp());
    if (error_1.isError(thenTE))
        return thenTE;
    if (error_1.isError(altTE))
        return altTE;
    const constraint2 = exports.checkCompatibleTypes(thenTE, altTE) && exports.checkCompatibleTypes(altTE, thenTE); // error if thenTE != altTE
    if (error_1.isError(constraint1))
        return constraint1;
    else if (error_1.isError(constraint2))
        return TExp_1.makeUnionTExp([thenTE, altTE]);
    else
        return thenTE;
};
// Purpose: compute the type of a proc-exp
// Typing rule:
// If   type<body>(extend-tenv(x1=t1,...,xn=tn; tenv)) = t
// then type<lambda (x1:t1,...,xn:tn) : t exp)>(tenv) = (t1 * ... * tn -> t)
exports.typeofProc = (proc, tenv) => {
    const argsTEs = ramda_1.map((vd) => vd.texp, proc.args);
    const extTEnv = TEnv_1.makeExtendTEnv(ramda_1.map((vd) => vd.var, proc.args), argsTEs, tenv);
    const blo = exports.typeofExps(proc.body, extTEnv);
    if (error_1.isError(blo))
        return blo;
    const constraint1 = exports.checkCompatibleTypes(blo, proc.returnTE);
    if (error_1.isError(constraint1))
        return constraint1;
    else
        return TExp_1.makeProcTExp(argsTEs, proc.returnTE);
};
// Purpose: compute the type of an app-exp
// Typing rule:
// If   type<rator>(tenv) = (t1*..*tn -> t)
//      type<rand1>(tenv) = t1
//      ...
//      type<randn>(tenv) = tn
// then type<(rator rand1...randn)>(tenv) = t
// We also check the correct number of arguments is passed.
exports.typeofApp = (app, tenv) => {
    const ratorTE = exports.typeofExp(app.rator, tenv);
    if (!TExp_1.isProcTExp(ratorTE))
        return Error(`Application of non-procedure: ${TExp_1.unparseTExp(ratorTE)} in ${L5_ast_1.unparse(app)}`);
    if (app.rands.length !== ratorTE.paramTEs.length)
        return Error(`Wrong parameter numbers passed to proc: ${L5_ast_1.unparse(app)}`);
    // const constraints = zipWith((rand, trand) => checkEqualType(typeofExp(rand, tenv), trand, app),
    //     app.rands, ratorTE.paramTEs);
    const constraints = ramda_1.zipWith((rand, trand) => {
        let boo = exports.typeofExp(rand, tenv);
        if (error_1.isError(boo))
            return boo;
        return exports.checkCompatibleTypes(boo, trand);
    }, app.rands, ratorTE.paramTEs);
    if (error_1.hasNoError(constraints))
        return ratorTE.returnTE;
    else
        return Error(error_1.getErrorMessages(constraints));
};
// Purpose: compute the type of a let-exp
// Typing rule:
// If   type<val1>(tenv) = t1
//      ...
//      type<valn>(tenv) = tn
//      type<body>(extend-tenv(var1=t1,..,varn=tn; tenv)) = t
// then type<let ((var1 val1) .. (varn valn)) body>(tenv) = t
exports.typeofLet = (exp, tenv) => {
    const vars = ramda_1.map((b) => b.var.var, exp.bindings);
    const vals = ramda_1.map((b) => b.val, exp.bindings);
    const varTEs = ramda_1.map((b) => b.var.texp, exp.bindings);
    // const constraints = zipWith((varTE, val) => checkEqualType(varTE, typeofExp(val, tenv), exp),
    //     varTEs, vals);
    const constraints = ramda_1.zipWith((varTe, val) => {
        let boo = exports.typeofExp(val, tenv);
        if (error_1.isError(boo))
            return boo;
        return exports.checkCompatibleTypes(boo, varTe);
    }, varTEs, vals);
    if (error_1.hasNoError(constraints))
        return exports.typeofExps(exp.body, TEnv_1.makeExtendTEnv(vars, varTEs, tenv));
    else
        return Error(error_1.getErrorMessages(constraints));
};
// Purpose: compute the type of a letrec-exp
// We make the same assumption as in L4 that letrec only binds proc values.
// Typing rule:
//   (letrec((p1 (lambda (x11 ... x1n1) body1)) ...) body)
//   tenv-body = extend-tenv(p1=(t11*..*t1n1->t1)....; tenv)
//   tenvi = extend-tenv(xi1=ti1,..,xini=tini; tenv-body)
// If   type<body1>(tenv1) = t1
//      ...
//      type<bodyn>(tenvn) = tn
//      type<body>(tenv-body) = t
// then type<(letrec((p1 (lambda (x11 ... x1n1) body1)) ...) body)>(tenv-body) = t
exports.typeofLetrec = (exp, tenv) => {
    const ps = ramda_1.map((b) => b.var.var, exp.bindings);
    const procs = ramda_1.map((b) => b.val, exp.bindings);
    if (!list_1.allT(L5_ast_1.isProcExp, procs))
        return Error(`letrec - only support binding of procedures - ${exp}`);
    const paramss = ramda_1.map((p) => p.args, procs);
    const bodies = ramda_1.map((p) => p.body, procs);
    const tijs = ramda_1.map((params) => ramda_1.map((p) => p.texp, params), paramss);
    const tis = ramda_1.map((proc) => proc.returnTE, procs);
    const tenvBody = TEnv_1.makeExtendTEnv(ps, ramda_1.zipWith((tij, ti) => TExp_1.makeProcTExp(tij, ti), tijs, tis), tenv);
    const tenvIs = ramda_1.zipWith((params, tij) => TEnv_1.makeExtendTEnv(ramda_1.map((p) => p.var, params), tij, tenvBody), paramss, tijs);
    const types = ramda_1.zipWith((bodyI, tenvI) => exports.typeofExps(bodyI, tenvI), bodies, tenvIs);
    // const constraints: (true | Error)[] = zipWith((typeI, ti) => checkEqualType(typeI, ti, exp), types, tis);
    const constraints = ramda_1.zipWith((typeI, ti) => {
        if (error_1.isError(typeI))
            return typeI;
        return exports.checkCompatibleTypes(typeI, ti) === false || error_1.isError(exports.checkCompatibleTypes(typeI, ti)) ? Error("Error : will never happen") : true;
    }, types, tis);
    if (error_1.hasNoError(constraints))
        return exports.typeofExps(exp.body, tenvBody);
    else
        return Error(error_1.getErrorMessages(constraints));
};
// Typecheck a full program
// TODO: Thread the TEnv (as in L1)
// Purpose: compute the type of a define
// Typing rule:
//   (define (var : texp) val)
// TODO - write the true definition
exports.typeofDefine = (exp, tenv) => {
    // return Error("TODO");
    return TExp_1.makeVoidTExp();
};
// Purpose: compute the type of a program
// Typing rule:
// TODO - write the true definition
exports.typeofProgram = (exp, tenv) => {
    return Error("TODO");
};
// TODO: 
exports.checkCompatibleTypes = (te1, te2) => {
    let errorMsg = Error(`Incompatible types: ${TExp_1.unparseTExp(te1)} and ${TExp_1.unparseTExp(te2)}`);
    if (error_1.isError(te1))
        return te1;
    if (error_1.isError(te2))
        return te2;
    if (TExp_1.isAtomicTExp(te1)) {
        if (TExp_1.isAtomicTExp(te2)) {
            if (deepEqual(te1, te2) === true) {
                return true;
            }
            else {
                return errorMsg;
            }
        }
        if (TExp_1.isUnionTExp(te2)) {
            if (L5_ast_1.isEmpty(ramda_1.filter((t2) => !error_1.isError(exports.checkCompatibleTypes(te1, t2)), te2.params))) {
                return errorMsg;
            }
            else {
                return true;
            }
        }
        if (TExp_1.isProcTExp(te2)) {
            return errorMsg;
        }
    }
    else if (TExp_1.isUnionTExp(te1)) {
        if (TExp_1.isAtomicTExp(te2)) {
            return errorMsg;
        }
        if (TExp_1.isUnionTExp(te2)) {
            if (ramda_1.reduce((acc, curr) => acc && !L5_ast_1.isEmpty(ramda_1.filter((typeInList) => !error_1.isError(exports.checkCompatibleTypes(typeInList, curr)), te2.params)), true, te1.params) === true) {
                return true;
            }
            else {
                return errorMsg;
            }
        }
        if (TExp_1.isProcTExp(te2)) {
            return errorMsg;
        }
    }
    else if (TExp_1.isProcTExp(te1)) {
        if (TExp_1.isAtomicTExp(te2)) {
            return errorMsg;
        }
        if (TExp_1.isUnionTExp(te2)) {
            return errorMsg;
        }
        if (TExp_1.isProcTExp(te2)) {
            if (te1.paramTEs.length !== te2.paramTEs.length) {
                return errorMsg;
            }
            else {
                if (L5_ast_1.isEmpty(ramda_1.filter((x) => error_1.isError(x), ramda_1.zipWith(exports.checkCompatibleTypes, te1.paramTEs, te2.paramTEs))) //staying positive
                    && exports.checkCompatibleTypes(te1.returnTE, te2.returnTE) === true) {
                    return true;
                }
                else {
                    return errorMsg;
                }
            }
        }
    }
};
