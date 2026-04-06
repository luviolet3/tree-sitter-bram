
/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

/**
 * Creates a rule that matches zero-or-more occurrences of a given rule seperated by a delimiter
 * 
 * @file Bram parser for tree-sitter
 * 
 * @license MIT
 * @param {RuleOrLiteral} rule rule to repeat, zero or more times
 * @param {RuleOrLiteral} del delimiter to seperate rule
 */
function delimited(rule, del) { return seq(repeat(seq(rule, del)), rule)}
/**
 * Creates a rule that matches one-or-more occurrences of a given rule seperated by a delimiter.
 * 
 * @file Bram parser for tree-sitter
 * 
 * @license MIT
 * @param {RuleOrLiteral} rule rule to repeat, one or more times
 * @param {RuleOrLiteral} del delimiter to seperate rule
 */
function delimited1(rule, del) { return seq(repeat1(seq(rule, del)), rule)}

export default grammar({
  name: "bram",

  supertypes: $ => [
    $.expr
  ],

  extras: $ => [
    / |\t/
  ],

  // @ts-ignore
  reserved: {
    keywords: $ => ['forall', 'exists']
  },

  rules: {
    main: $ => seq($.expr, '\n'),

    /// Parses a variable, ensuring it is not a reserved keyword
    variable: $ => field('name', /[a-zA-Z1-9_]+/),

    /// Matches logical keywords ('forall' or 'exists')
    keyword: $ => prec(1, choice('forall', 'exists')),

    /// Parses a logical contradiction (e.g., '_⊥_')
    contradiction: $ => choice('_|_', '⊥'),

    /// Parses a logical tautology (e.g., '⊤')
    tautology: $ => choice('^|^', '⊤'),

    /// Parses a negation term (e.g., '¬A')
    notterm: $ => seq(
      choice('~', '¬'),
      field('inner', $.paren_expr)
    ),

    /// Parses a predicate or variable term
    predicate: $ => choice(
      seq(
        field('name', $.variable),
        '(',
        field('arguments',
          seq(
            repeat(seq($.expr, ',')),
            $.expr,
          )
        ),
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

    /// Parses an equivalence operator (e.g., '===' or '≡')
    equivrepr: $ => choice('===', '≡'),

    /// Parses an addition operator ('+')
    plusrepr: $ => '+',

    /// Parses a multiplication operator ('*')
    multrepr: $ => '*',

    /// Parses a sequence of associative terms and their operators
    /// Enforce that all symbols are the same.
    /// This check is what rules out `(a /\ b \/ c)` without further parenthesization.
    assoc_term: $ => {
      let ops = [
        alias($.andrepr, '∧'),
        alias($.orrepr, '∨'),
        alias($.biconrepr, '↔'),
        alias($.equivrepr, '≡'),
        alias($.plusrepr, '+'),
        alias($.multrepr, '*'),
      ]
      return choice(...ops.map(op => delimited1($.paren_expr, op)));
    },

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
