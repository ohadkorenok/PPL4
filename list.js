"use strict";
// List operations similar to car/cdr/cadr in Scheme
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
exports.first = (x) => x[0];
exports.second = (x) => x[1];
exports.rest = (x) => x.slice(1);
// A useful type predicate for homegeneous lists
exports.allT = (isT, x) => ramda_1.all(isT, x);
