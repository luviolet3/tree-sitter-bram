import XCTest
import SwiftTreeSitter
import TreeSitterBram

final class TreeSitterBramTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_bram())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Bram grammar")
    }
}
