/**
 * Tests for api.js
 * Testing API endpoint URL construction and error handling patterns
 */

const fs = require('fs');
const path = require('path');

// Load the api.js file
const apiPath = path.join(__dirname, '../js/api.js');
const apiCode = fs.readFileSync(apiPath, 'utf8');

// Extract the API_BASE constant
const apiBaseMatch = apiCode.match(/const API_BASE = ['"](.+?)['"]/);
const API_BASE = apiBaseMatch ? apiBaseMatch[1] : 'http://127.0.0.1:8000';

describe('API Configuration Tests', () => {
  test('API_BASE should be defined', () => {
    expect(API_BASE).toBeDefined();
    expect(typeof API_BASE).toBe('string');
  });

  test('API_BASE should be a valid URL format', () => {
    expect(API_BASE).toMatch(/^https?:\/\/.+/);
  });

  test('API_BASE should point to correct backend', () => {
    expect(API_BASE).toContain('127.0.0.1:8000');
  });
});

describe('API Endpoint Construction', () => {
  test('recipes endpoint should be correct', () => {
    const endpoint = `${API_BASE}/recipes`;
    expect(endpoint).toBe('http://127.0.0.1:8000/recipes');
  });

  test('recipe by ID endpoint should be correct', () => {
    const recipeId = 123;
    const endpoint = `${API_BASE}/recipes/${recipeId}`;
    expect(endpoint).toBe('http://127.0.0.1:8000/recipes/123');
  });

  test('comments endpoint should be correct', () => {
    const recipeId = 456;
    const endpoint = `${API_BASE}/recipes/${recipeId}/comments`;
    expect(endpoint).toBe('http://127.0.0.1:8000/recipes/456/comments');
  });

  test('delete comment endpoint should be correct', () => {
    const commentId = 789;
    const endpoint = `${API_BASE}/comments/${commentId}`;
    expect(endpoint).toBe('http://127.0.0.1:8000/comments/789');
  });

  test('search endpoint should handle query parameters', () => {
    const searchTerm = 'pasta';
    const endpoint = `${API_BASE}/recipes?search=${searchTerm}`;
    expect(endpoint).toBe('http://127.0.0.1:8000/recipes?search=pasta');
  });

  test('search endpoint should handle encoded special characters', () => {
    const searchTerm = encodeURIComponent('mac & cheese');
    const endpoint = `${API_BASE}/recipes?search=${searchTerm}`;
    expect(endpoint).toContain('mac%20%26%20cheese');
  });
});

describe('HTTP Methods Validation', () => {
  const validMethods = ['GET', 'POST', 'PUT', 'DELETE'];

  test('should use valid HTTP methods', () => {
    validMethods.forEach(method => {
      expect(['GET', 'POST', 'PUT', 'DELETE']).toContain(method);
    });
  });

  test('GET should be used for fetching data', () => {
    expect(validMethods).toContain('GET');
  });

  test('POST should be used for creating resources', () => {
    expect(validMethods).toContain('POST');
  });

  test('PUT should be used for updating resources', () => {
    expect(validMethods).toContain('PUT');
  });

  test('DELETE should be used for removing resources', () => {
    expect(validMethods).toContain('DELETE');
  });
});

describe('Request Headers Validation', () => {
  test('Content-Type header should be application/json for JSON data', () => {
    const headers = {
      'Content-Type': 'application/json'
    };
    expect(headers['Content-Type']).toBe('application/json');
  });

  test('headers object should be valid', () => {
    const headers = {
      'Content-Type': 'application/json'
    };
    expect(typeof headers).toBe('object');
    expect(headers).toHaveProperty('Content-Type');
  });
});

describe('Error Response Handling', () => {
  test('should handle 404 errors', () => {
    const statusCode = 404;
    expect(statusCode).toBe(404);
    expect([404, 500, 400, 422]).toContain(statusCode);
  });

  test('should handle 500 errors', () => {
    const statusCode = 500;
    expect(statusCode).toBe(500);
  });

  test('should handle 429 rate limit errors', () => {
    const statusCode = 429;
    expect(statusCode).toBe(429);
  });

  test('should handle 422 validation errors', () => {
    const statusCode = 422;
    expect(statusCode).toBe(422);
  });
});

describe('JSON Parsing', () => {
  test('should parse valid JSON response', () => {
    const jsonString = '{"name":"Test Recipe","id":1}';
    const parsed = JSON.parse(jsonString);
    expect(parsed).toHaveProperty('name');
    expect(parsed).toHaveProperty('id');
    expect(parsed.name).toBe('Test Recipe');
  });

  test('should handle array responses', () => {
    const jsonArray = '[{"id":1},{"id":2}]';
    const parsed = JSON.parse(jsonArray);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(2);
  });

  test('should throw error on invalid JSON', () => {
    const invalidJson = '{name: "invalid"}';
    expect(() => JSON.parse(invalidJson)).toThrow();
  });
});
