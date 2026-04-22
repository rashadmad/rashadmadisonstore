# Checkout Module Tests

This directory contains unit tests for the checkout module components and templates.

## Test Files

- `checkout-form.test.tsx` - Tests for the main checkout form template
- `checkout-summary.test.tsx` - Tests for the checkout summary display
- `error-message.test.tsx` - Tests for the error message component
- `submit-button.test.tsx` - Tests for the submit button component
- `discount-code.test.tsx` - Tests for the discount code component

## Test Coverage

The tests cover:
- Form rendering and component composition
- Data fetching (shipping and payment methods)
- Error handling for missing data
- Summary display with cart information
- Error message display and styling
- Submit button states and variants
- Discount code management
- Conditional rendering based on cart state

## Running Tests

```bash
# Run all checkout tests
npm test -- src/modules/checkout/__tests__

# Run specific test file
npm test -- src/modules/checkout/__tests__/checkout-form.test.tsx
```

## Mocking

Tests use Jest mocks for:
- API data fetching functions
- Medusa UI components
- React form status (useFormStatus)
- Common UI components
- Icon components
- Utility functions (money conversion)
