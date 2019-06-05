"use strict";
// Environment for L5 with mutation
// ================================
// An environment represents a partial function from symbols (variable names) to values.
// It supports the operation: applyEnv(env,var)
// which either returns the value of var in the environment, or else an error.
//
// A box-env represents an environment as a mapping from var to boxes containing values.
// The global environment is the root of all extended environment.
// It contains a frame that is initialized with primitive bindings
// and can be extended with the define operator.
//
// Box-Env is defined inductively by the following cases:
// * <box-env> ::= <global-env> | <extended-box-env>
// * <global-env> ::= (global-env frame) // global-env(frame:Box(Frame))
// * <extended-box-env> ::= (extended-box-env frame enclosing-env)
//      // extended-box-env(frame: Frame, enclosing-env: Box-env)
//
// Frame:
// * <fbinding> ::= (var val) // binding(var:string, val:Box(Value))
// * <frame> ::= (frame (var val)*) // frame(bindings:List(fbinding))
// applyFrame(frame, var) => val
// applyFrameBdg(frame, var) => Box(val)
//
// The key operation on env is applyEnv(env, var) which returns the value associated to var in env
// or returns an error if var is not defined in env.
// To support mutation - we also add applyEnvBdg(env, var) -> Box(val)
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const box_1 = require("./box");
const error_1 = require("./error");
;
const isFBinding = (x) => x.tag === "FBinding";
const makeFBinding = (v, val) => ({ tag: "FBinding", var: v, val: box_1.makeBox(val) });
const getFBindingVar = (f) => f.var;
exports.getFBindingVal = (f) => box_1.unbox(f.val);
exports.setFBinding = (f, val) => { box_1.setBox(f.val, val); return; };
;
const makeFrame = (vars, vals) => ({ tag: "Frame", fbindings: ramda_1.zipWith(makeFBinding, vars, vals) });
const extendFrame = (frame, v, val) => ({ tag: "Frame", fbindings: [makeFBinding(v, val)].concat(frame.fbindings) });
const isFrame = (x) => x.tag === "Frame";
const frameVars = (frame) => ramda_1.map(getFBindingVar, frame.fbindings);
const frameVals = (frame) => ramda_1.map(exports.getFBindingVal, frame.fbindings);
const applyFrame = (frame, v) => {
    const pos = frameVars(frame).indexOf(v);
    return (pos > -1) ? frame.fbindings[pos] : Error(`Var not found: ${v}`);
};
const setVarFrame = (frame, v, val) => {
    const bdg = applyFrame(frame, v);
    return error_1.isError(bdg) ? bdg : exports.setFBinding(bdg, val);
};
exports.isEnv = (x) => exports.isExtEnv(x) || exports.isGlobalEnv(x);
/*
Purpose: lookup the value of var in env and return a mutable binding
Signature: applyEnvBdg(env, var)
Type: [Env * string -> FBinding | Error]
*/
exports.applyEnvBdg = (env, v) => exports.isGlobalEnv(env) ? applyGlobalEnvBdg(env, v) :
    exports.isExtEnv(env) ? applyExtEnvBdg(env, v) :
        Error(`Bad env type ${env}`);
/*
Purpose: lookup the value of var in env.
Signature: applyEnv(env, var)
Type: [Env * string -> Value4 | Error]
*/
exports.applyEnv = (env, v) => {
    const bdg = exports.applyEnvBdg(env, v);
    return error_1.isError(bdg) ? bdg : exports.getFBindingVal(bdg);
};
;
exports.isExtEnv = (x) => x.tag === "ExtEnv";
exports.makeExtEnv = (vs, vals, env) => ({ tag: "ExtEnv", frame: makeFrame(vs, vals), env: env });
exports.ExtEnvVars = (env) => ramda_1.map(getFBindingVar, env.frame.fbindings);
exports.ExtEnvVals = (env) => ramda_1.map(exports.getFBindingVal, env.frame.fbindings);
const applyExtEnvBdg = (env, v) => {
    const bdg = applyFrame(env.frame, v);
    if (error_1.isError(bdg))
        return exports.applyEnvBdg(env.env, v);
    else
        return bdg;
};
;
exports.isGlobalEnv = (x) => x.tag === "GlobalEnv";
const makeGlobalEnv = () => ({ tag: "GlobalEnv", frame: box_1.makeBox(makeFrame([], [])) });
// There is a single mutable value in the type Global-env
exports.theGlobalEnv = makeGlobalEnv();
const globalEnvSetFrame = (ge, f) => box_1.setBox(ge.frame, f);
exports.globalEnvAddBinding = (v, val) => globalEnvSetFrame(exports.theGlobalEnv, extendFrame(box_1.unbox(exports.theGlobalEnv.frame), v, val));
const applyGlobalEnvBdg = (ge, v) => applyFrame(box_1.unbox(ge.frame), v);
