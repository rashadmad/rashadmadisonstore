# Shipping Module Tests

This directory contains unit tests for the shipping module components.

## Test Files

- `free-shipping-price-nudge.test.tsx` - Tests for the free shipping price nudge component

## Running Tests

```bash
# Run all shipping tests
npm test -- src/modules/shipping/__tests__

# Run specific test file
npm test -- src/modules/shipping/__tests__/free-shipping-price-nudge.test.tsx
```

## Test Coverage

The tests cover:
- Component rendering with different variants (inline/popup)
- Conditional rendering based on cart state and shipping options
- Price calculation logic for different operators (gte, gt, lt, lte, eq)
- Target reached/unreached states
- Popup visibility and close functionality
- Currency filtering
- Price rule attribute filtering
- Null/undefined input handling

## Mocking

Tests use Jest mocks for:
- Medusa UI components (Button, clx)
- Medusa icons (CheckCircleSolid, XMark)
- Money utility functions (convertToLocale)
- Common components (LocalizedClientLink)
- Medusa types

## Component Under Test

The `free-shipping-price-nudge` component displays:
- An inline progress bar showing how close the cart is to free shipping
- A popup notification with the same information
- Dynamic messaging based on whether free shipping threshold is reached
- Links to view cart or continue shopping