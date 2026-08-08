import '@testing-library/jest-dom'

// Add TextEncoder and TextDecoder to global scope for tests
global.TextEncoder = require('util').TextEncoder
global.TextDecoder = require('util').TextDecoder

let nodeFetchModule = null

try {
	nodeFetchModule = require('node-fetch')
} catch {
	nodeFetchModule = null
}

// Add Request and Response to global scope for tests
global.Request = global.Request || nodeFetchModule?.Request || class Request {}
global.Response = global.Response || nodeFetchModule?.Response || class Response {}

// Add fetch to global scope if not available
global.fetch = global.fetch || nodeFetchModule?.default || nodeFetchModule

// Add TransformStream to global scope for tests
global.TransformStream = global.TransformStream || class TransformStream {}
