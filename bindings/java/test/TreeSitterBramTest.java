import io.github.treesitter.jtreesitter.Language;
import io.github.treesitter.jtreesitter.bram.TreeSitterBram;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

public class TreeSitterBramTest {
    @Test
    public void testCanLoadLanguage() {
        assertDoesNotThrow(() -> new Language(TreeSitterBram.language()));
    }
}
