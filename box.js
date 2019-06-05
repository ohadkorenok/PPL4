"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBox = (x) => ([x]);
exports.unbox = (b) => b[0];
exports.setBox = (b, v) => { b[0] = v; return; };
