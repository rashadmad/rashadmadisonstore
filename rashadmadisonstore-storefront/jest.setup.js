import '@testing-library/jest-dom'

// Add TextEncoder and TextDecoder to global scope for tests
global.TextEncoder = require('util').TextEncoder
global.TextDecoder = require('util').TextDecoder

// Add Request and Response to global scope for tests
global.Request = global.Request || require('node-fetch').Request || class Request {}
global.Response = global.Response || require('node-fetch').Response || class Response {}

// Add fetch to global scope if not available
global.fetch = global.fetch || require('node-fetch')

// Add TransformStream to global scope for tests
global.TransformStream = global.TransformStream || class TransformStream {}
