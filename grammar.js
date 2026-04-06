/**
 * @file Bram parser for tree-sitter
 * @author violet Lu
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "bram",

  supertypes: $ => [
    $.expr
  ],

  extras: $ => [
    / |\t/
  ],

  reserved: {
    keywords: $ => ['forall', 'exists']
  },

  rules: {
    main: $ => seq($.expr, '\n'),

    /// Parses a variable, ensuring it is not a reserved keyword
    variable: $ => /[a-zA-Z1-9_]+/,

    /// Matches logical keywords ('forall' or 'exists')
    keyword: $ => prec(1, choice('forall', 'exists')),

    /// Parses a logical contradiction (e.g., '_⊥_')
    contradiction: $ => choice('_|_', '⊥'),

    /// Parses a logical tautology (e.g., '⊤')
    tautology: $ => choice('^|^', '⊤'),

    /// Parses a negation term (e.g., '¬A')
    notterm: $ => seq(
      choice('~', '¬'),
      $.paren_expr
    ),

    /// Parses a predicate or variable term
    predicate: $ => choice(
      seq(
        $.variable,
        '(',
        repeat(seq($.expr, ',')),
        $.expr,
        ')'
      ),
      $.variable
    ),

    /// Parses a universal quantifier ('∀') and associates it with an expression
    _forall_repr: $ =>'forall',
    forall_quantifier: $ => choice(seq($._forall_repr, ' '), '∀'),

    /// Parses an existential quantifier ('∃') and associates it with an expression
    _exists_repr: $ =>'exists',
    exists_quantifier: $ => choice(seq($._exists_repr, ' '), '∃'),

    /// Parses any quantifier ('∀' or '∃')
    quantifier: $ => choice($.forall_quantifier, $.exists_quantifier),

    /// Parses a logical binder (quantifier + variable + body)
    binder: $ => seq(
      $.quantifier,
      $.variable,
      choice(
        // Parse multiple terms enclosed in parentheses
        prec(1, seq('(', $.expr, ')')),
        // Parse a single term without parentheses
        prec(0, $.paren_expr)
      )
    ),

    /// Parses an implication term (e.g., 'A -> B' or 'A → B')
    impl_term: $ => seq(
      $.paren_expr,
      choice('->', '→'),
      $.paren_expr
    ),

    /// Parses an AND operator (e.g., '&', '∧', or '/\')
    andrepr: $ => choice('&', '∧', '/\\'),

    /// Parses an OR operator (e.g., '|', '∨', or '\/')
    orrepr: $ => choice('|', '∨', '\\/'),

    /// Parses a biconditional operator (e.g., '<->' or '↔')
    biconrepr: $ => choice('<->', '↔'),

    /// Parses an equivalence operator (e.g., '===' or '≡')/// Parses an equivalence operator (e.g., '===' or '≡')
    equivrepr: $ => choice('===', '≡'),

    /// Parses an addition operator ('+')
    plusrepr: $ => '+',

    /// Parses a multiplication operator ('*')
    multrepr: $ => '*',

    /// Parses a sequence of associative terms and their operators
    _assoc_term_aux: $ => choice(
      seq(
        $.paren_expr,
        choice(
          $.andrepr,
          $.orrepr,
          $.biconrepr,
          $.equivrepr,
          $.plusrepr,
          $.multrepr
        ),
        $._assoc_term_aux
      ),
      $.paren_expr
    ),
// fn assoc_term_aux(input: &str) -> IResult<&str, (Vec<Expr>, Vec<Op>)> {
//   alt((
//       map(
//         tuple((
//           paren_expr,
//           delimited(
//             space,
//             alt((
//               andrepr,
//               orrepr,
//               biconrepr,
//               equivrepr,
//               plusrepr,
//               multrepr
//             )),
//             space
//           ),
//           assoc_term_aux
//         )),
//         |(e, sym, (mut es, mut syms))| {
//           es.push(e);
//           syms.push(sym);
//           (es, syms)
//         }
//       ),
//       map(
//         paren_expr,
//         |e| (vec![e], vec![])
//       ),
//   ))(input)
// }

    /// Enforce that all symbols are the same.
    /// This check is what rules out `(a /\ b \/ c)` without further parenthesization.
    assoc_term: $ => $._assoc_term_aux,
    // fn assoc_term(s: &str) -> nom::IResult<&str, Expr> {
    //   let (rest, (mut exprs, syms)) = assoc_term_aux(s)?;
    //   assert_eq!(exprs.len(), syms.len() + 1);
    //   if exprs.len() == 1 {
    //       return custom_error(rest);
    //   }
    //   let op = syms[0];
    //   if !syms.iter().all(|x| x == &op) {
    //       return custom_error(rest);
    //   }
    //   exprs.reverse();
    //   Ok((rest, Expr::Assoc { op, exprs }))
    // }

    /// paren_expr is a factoring of expr that eliminates left-recursion, which parser combinators have trouble with
    paren_expr: $ => choice(
      $.contradiction,
      $.tautology,
      $.predicate,
      $.notterm,
      $.binder,
      seq('(', $.expr, ')')
    ),

    expr: $ => choice($.assoc_term, $.impl_term, prec(2, $.paren_expr)),
  }
});
