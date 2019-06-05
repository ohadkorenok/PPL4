"use strict";
/*
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Type Environment
;; ================
;; An environment represents a partial function from symbols (variable names) to type expressions.
;; It supports the operation: applyTenv(tenv,var)
;; which either returns the type of var in the type-environment, or else an error.
;;
;; TEnv is defined exactly as Env - except that we map vars to type-expressions (TExp) instead of values.
;; * <tenv> ::= <empty-tenv> | <extended-tenv>
;; * <empty-tenv> ::= empty-tenv()
;; * <extended-tenv> ::= (tenv (symbol+) (type-exp+) enclosing-tenv) // env(vars:List(Symbol), tes:List(Type-exp), enclosing-tenv: TEnv)
*/
Object.defineProperty(exports, "__esModule", { value: true });
;
exports.makeEmptyTEnv = () => ({ tag: "EmptyTEnv" });
exports.isEmptyTEnv = (x) => x.tag === "EmptyTEnv";
;
exports.makeExtendTEnv = (vars, texps, tenv) => ({ tag: "ExtendTEnv", vars: vars, texps: texps, tenv: tenv });
exports.isExtendTEnv = (x) => x.tag === "ExtendTEnv";
exports.applyTEnv = (tenv, v) => exports.isEmptyTEnv(tenv) ? Error(`Type Variable not found ${v}`) :
    exports.applyExtendTEnv(tenv.texps, tenv.tenv, v, tenv.vars.indexOf(v));
exports.applyExtendTEnv = (texps, tenv, v, pos) => (pos === -1) ? exports.applyTEnv(tenv, v) :
    texps[pos];
