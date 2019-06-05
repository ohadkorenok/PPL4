"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// L5-typecheck
const assert_1 = require("assert");
const L5_ast_1 = require("./L5-ast");
const L5_typecheck_1 = require("./L5-typecheck");
const TEnv_1 = require("./TEnv");
const TExp_1 = require("./TExp");
// parseTE
var pita = TExp_1.parseTE("number | boolean");
assert_1.strict.deepEqual(TExp_1.parseTE("number"), TExp_1.makeNumTExp());
assert_1.strict.deepEqual(TExp_1.parseTE("boolean"), TExp_1.makeBoolTExp());
assert_1.strict.deepEqual(TExp_1.parseTE("T1"), TExp_1.makeTVar("T1"));
assert_1.strict.deepEqual(TExp_1.parseTE("(T * T -> boolean)"), TExp_1.makeProcTExp([TExp_1.makeTVar("T"), TExp_1.makeTVar("T")], TExp_1.makeBoolTExp()));
assert_1.strict.deepEqual(TExp_1.parseTE("(number -> (number -> number))"), TExp_1.makeProcTExp([TExp_1.makeNumTExp()], TExp_1.makeProcTExp([TExp_1.makeNumTExp()], TExp_1.makeNumTExp())));
assert_1.strict.deepEqual(TExp_1.parseTE("void"), TExp_1.makeVoidTExp());
assert_1.strict.deepEqual(TExp_1.parseTE("(Empty -> void)"), TExp_1.makeProcTExp([], TExp_1.makeVoidTExp()));
// unparseTExp
assert_1.strict.deepEqual(TExp_1.unparseTExp(TExp_1.makeNumTExp()), "number");
assert_1.strict.deepEqual(TExp_1.unparseTExp(TExp_1.makeBoolTExp()), "boolean");
assert_1.strict.deepEqual(TExp_1.unparseTExp(TExp_1.makeTVar("T1")), "T1");
assert_1.strict.deepEqual(TExp_1.unparseTExp(TExp_1.makeProcTExp([TExp_1.makeTVar("T"), TExp_1.makeTVar("T")], TExp_1.makeBoolTExp())), "(T * T -> boolean)");
assert_1.strict.deepEqual(TExp_1.unparseTExp(TExp_1.makeProcTExp([TExp_1.makeNumTExp()], TExp_1.makeProcTExp([TExp_1.makeNumTExp()], TExp_1.makeNumTExp()))), "(number -> (number -> number))");
// parse with type annotations
assert_1.strict.deepEqual(L5_ast_1.parse("(define (a : number) 1)"), L5_ast_1.makeDefineExp(L5_ast_1.makeVarDecl("a", TExp_1.makeNumTExp()), L5_ast_1.makeNumExp(1)));
assert_1.strict.deepEqual(L5_ast_1.parse("(lambda ((x : number)) : number x)"), L5_ast_1.makeProcExp([L5_ast_1.makeVarDecl("x", TExp_1.makeNumTExp())], [L5_ast_1.makeVarRef("x")], TExp_1.makeNumTExp()));
// L5typeof
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("5"), "number");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("#t"), "boolean");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("+"), "(number * number -> number)");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("-"), "(number * number -> number)");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("*"), "(number * number -> number)");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("/"), "(number * number -> number)");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("="), "(number * number -> boolean)");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("<"), "(number * number -> boolean)");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof(">"), "(number * number -> boolean)");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("not"), "(boolean -> boolean)");
// typeof varref in a given TEnv
assert_1.strict.deepEqual(L5_typecheck_1.typeofExp(L5_ast_1.parse("x"), TEnv_1.makeExtendTEnv(["x"], [TExp_1.makeNumTExp()], TEnv_1.makeEmptyTEnv())), TExp_1.makeNumTExp());
// IfExp
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("(if (> 1 2) 1 2)"), "number");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("(if (= 1 2) #t #f)"), "boolean");
// ProcExp
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("(lambda ((x : number)) : number x)"), "(number -> number)");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("(lambda ((x : number)) : boolean (> x 1))"), "(number -> boolean)");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("(lambda((x : number)) : (number -> number) (lambda((y : number)) : number (* y x)))"), "(number -> (number -> number))");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("(lambda((f : (number -> number))) : number (f 2))"), "((number -> number) -> number)");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof(`(lambda((x : number)) : number
                             (let (((y : number) x)) (+ x y)))`), "(number -> number)");
// LetExp
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("(let (((x : number) 1)) (* x 2))"), "number");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof(`(let (((x : number) 1)
                                 ((y : number) 2))
                              (lambda((a : number)) : number (+ (* x a) y)))`), "(number -> number)");
// Letrec
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof(`(letrec (((p1 : (number -> number)) (lambda((x : number)) : number (* x x))))
                             p1)`), "(number -> number)");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof(`(letrec (((p1 : (number -> number)) (lambda((x : number)) : number (* x x))))
                             (p1 2))`), "number");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof(`(letrec (((odd? : (number -> boolean)) (lambda((n : number)) : boolean
                                                                    (if (= n 0) #f (even? (- n 1)))))
                                    ((even? : (number -> boolean)) (lambda((n : number)) : boolean
                                                                     (if (= n 0) #t (odd? (- n 1))))))
                    (odd? 12))`), "boolean");
// define
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("(define (foo : number) 5)"), "void");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("(define (foo : (number * number -> number)) (lambda((x : number) (y : number)) : number (+ x y)))"), "void");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("(define (x : (Empty -> number)) (lambda () : number 1))"), "void");
/*
// LitExp
assert.deepEqual(L5typeof("(quote ())"), "literal");

// Pair
assert.deepEqual(L5typeof("(cons 1 '())"), "(Pair number literal)");
assert.deepEqual(L5typeof("(cons 1 1)"), "(Pair number number)");
assert.deepEqual(L5typeof("(car (cons 1 1))"), "number");
 assert.deepEqual(L5typeof("(cdr (cons 1 #t))"), "boolean");
 assert.deepEqual(L5typeof("(cdr (cons (cons 1 2) (cons 1 2)))"), "(Pair number number)");
 assert.deepEqual(L5typeof("(cdr (cons (cons 1 2) (cons 1 #f)))"), "(Pair number boolean)");
 assert.deepEqual(L5typeof("(car (cons (cons 1 2) (cons 1 #f)))"), "(Pair number number)");
 assert.deepEqual(L5typeof("(car (cons (cons (cons #t #t) 2) (cons 1 #f)))"), "(Pair (Pair boolean boolean) number)");
 assert.deepEqual(L5typeof("(cdr (cons (cons (cons #t #t) 2) (cons 1 #f)))"), "(Pair number boolean)");
 assert.deepEqual(L5typeof("(lambda((a : number) (b : number)) : (Pair number number) (cons a b))"),
            ,     "(number * number -> (Pair number number))");
 assert.deepEqual(L5typeof("(lambda((a : number) (b : (Pair number boolean))) : (Pair number (Pair number boolean)) (cons a b))"),
                  "(number * (Pair number boolean) -> (Pair number (Pair number boolean)))");
 assert.deepEqual(L5typeof(`(lambda((a : (Pair number number))
                                    (b : (Pair number boolean))) :
                                    (Pair (Pair number number) (Pair (Pair number number) (Pair number boolean)))
                              (cons a (cons a b)))"),
            "((Pair number number) * (Pair number boolean) -> (Pair (Pair number number) (Pair (Pair number number) (Pair number boolean))))");


assert.deepEqual(L5typeof("(define (x : (Pair number boolean)) (cons 1 #t))"), "void");
assert.deepEqual(L5typeof("(define (x : (Pair (T1 -> T1) number)) (cons (lambda ((y : T1)) : T1 y) 2))"), "void");

*/
// Polymorphic tests
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("(lambda((x : T1)) : T1 x)"), "(T1 -> T1)");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof(`(let (((x : number) 1))
                             (lambda((y : T) (z : T)) : T
                               (if (> x 2) y z)))`), "(T * T -> T)");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof("(lambda () : number 1)"), "(Empty -> number)");
assert_1.strict.deepEqual(L5_typecheck_1.L5typeof(`(define (x : (T1 -> (T1 -> number)))
                             (lambda ((x : T1)) : (T1 -> number)
                               (lambda((y : T1)) : number 5)))`), "void");
