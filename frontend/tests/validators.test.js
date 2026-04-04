/**
 * Tests for validators.js
 * Testing input validation and sanitization functions
 */

const fs = require('fs');
const path = require('path');

// Load the validators.js file
const validatorsPath = path.join(__dirname, '../js/validators.js');
const validatorsCode = fs.readFileSync(validatorsPath, 'utf8');

// Extract and evaluate the sanitizeHTML function
const sanitizeHTMLMatch = validatorsCode.match(/function sanitizeHTML\([^)]*\) \{[\s\S]*?\n\}/);
if (!sanitizeHTMLMatch) {
  throw new Error('sanitizeHTML function not found in validators.js');
}
eval(sanitizeHTMLMatch[0]);

describe('Input Sanitization Tests', () => {
  describe('sanitizeHTML', () => {
    test('should escape script tags', () => {
      const input = '<script>alert("xss")</script>';
      const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;';
      expect(sanitizeHTML(input)).toBe(expected);
    });

    test('should escape img tags with onerror', () => {
      const input = '<img src=x onerror=alert("xss")>';
      const expected = '&lt;img src=x onerror=alert(&quot;xss&quot;)&gt;';
      expect(sanitizeHTML(input)).toBe(expected);
    });

    test('should escape less than and greater than symbols', () => {
      const input = '<div>Hello</div>';
      const expected = '&lt;div&gt;Hello&lt;/div&gt;';
      expect(sanitizeHTML(input)).toBe(expected);
    });

    test('should escape ampersands', () => {
      const input = 'Tom & Jerry';
      const expected = 'Tom &amp; Jerry';
      expect(sanitizeHTML(input)).toBe(expected);
    });

    test('should escape double quotes', () => {
      const input = 'Say "Hello"';
      const expected = 'Say &quot;Hello&quot;';
      expect(sanitizeHTML(input)).toBe(expected);
    });

    test('should escape single quotes', () => {
      const input = "It's a test";
      const expected = "It&#x27;s a test";
      expect(sanitizeHTML(input)).toBe(expected);
    });

    test('should handle empty strings', () => {
      expect(sanitizeHTML('')).toBe('');
    });

    test('should handle normal text without special characters', () => {
      const input = 'This is a normal recipe name';
      expect(sanitizeHTML(input)).toBe(input);
    });

    test('should handle multiple special characters', () => {
      const input = '<script>alert("XSS & \'injection\'")</script>';
      const expected = '&lt;script&gt;alert(&quot;XSS &amp; &#x27;injection&#x27;&quot;)&lt;/script&gt;';
      expect(sanitizeHTML(input)).toBe(expected);
    });

    test('should escape quotes in JavaScript execution attempts', () => {
      const input = 'javascript:alert("xss")';
      const output = sanitizeHTML(input);
      expect(output).toContain('javascript:');
      expect(output).toContain('&quot;');
      expect(output).toBe('javascript:alert(&quot;xss&quot;)');
    });

    test('should handle recipe names with special characters', () => {
      const input = "Grandma's <Famous> Mac & Cheese";
      const expected = "Grandma&#x27;s &lt;Famous&gt; Mac &amp; Cheese";
      expect(sanitizeHTML(input)).toBe(expected);
    });

    test('should handle comment text with quotes', () => {
      const input = 'This recipe is "amazing" and it\'s delicious!';
      const expected = 'This recipe is &quot;amazing&quot; and it&#x27;s delicious!';
      expect(sanitizeHTML(input)).toBe(expected);
    });
  });
});

describe('Edge Cases', () => {
  test('should handle null input gracefully', () => {
    // If your sanitizeHTML doesn't handle null, this will help catch it
    expect(() => sanitizeHTML(null)).not.toThrow();
  });

  test('should handle undefined input gracefully', () => {
    expect(() => sanitizeHTML(undefined)).not.toThrow();
  });

  test('should handle very long strings', () => {
    const longString = '<script>' + 'a'.repeat(10000) + '</script>';
    const result = sanitizeHTML(longString);
    expect(result).toContain('&lt;script&gt;');
    expect(result).toContain('&lt;/script&gt;');
  });

  test('should handle strings with only special characters', () => {
    const input = '<>&"\' ';
    const expected = '&lt;&gt;&amp;&quot;&#x27; ';
    expect(sanitizeHTML(input)).toBe(expected);
  });
});
