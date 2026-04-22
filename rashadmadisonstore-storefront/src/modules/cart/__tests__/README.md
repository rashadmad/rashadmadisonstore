# Cart Module Tests

This directory contains unit tests for the cart module components and templates.

## Test Files

- `item.test.tsx` - Tests for the individual cart item component
- `cart-template.test.tsx` - Tests for the main cart template
- `items-template.test.tsx` - Tests for the cart items template
- `summary.test.tsx` - Tests for the cart summary template
- `empty-cart-message.test.tsx` - Tests for the empty cart message component
- `sign-in-prompt.test.tsx` - Tests for the sign-in prompt component
- `cart-item-select.test.tsx` - Tests for the cart item select component

## Running Tests

```bash
# Run all cart tests
npm test -- src/modules/cart/__tests__

# Run specific test file
npm test -- src/modules/cart/__tests__/item.test.tsx
```

## Test Coverage

The tests cover:
- Component rendering
- Props handling
- User interactions (quantity changes, button clicks)
- Conditional rendering based on cart state
- Error handling
- Loading states

## Mocking

Tests use Jest mocks for:
- Medusa UI components
- Custom components from the common module
- Data fetching functions
- External dependencies