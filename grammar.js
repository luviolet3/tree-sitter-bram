/**
 * @file Bram parser for tree-sitter
 * @author violet Lu
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "bram",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
