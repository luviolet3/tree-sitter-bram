package tree_sitter_bram_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_bram "github.com/luviolet3/tree-sitter-bram/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_bram.Language())
	if language == nil {
		t.Errorf("Error loading Bram grammar")
	}
}
