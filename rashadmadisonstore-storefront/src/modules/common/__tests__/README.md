# Common Module Tests

This directory contains unit tests for the common module components that are used throughout the application.

## Test Files

- `localized-client-link.test.tsx` - Tests for the localized client link component that handles country code routing
- `line-item-price.test.tsx` - Tests for the line item price component that displays prices with discounts
- `line-item-unit-price.test.tsx` - Tests for the unit price component that calculates per-item pricing
- `cart-totals.test.tsx` - Tests for the cart totals component that displays order summaries
- `delete-button.test.tsx` - Tests for the delete button component with loading states
- `input.test.tsx` - Tests for the custom input component with password visibility toggle

## Running Tests

```bash
# Run all common tests
npm test -- src/modules/common/__tests__

# Run specific test file
npm test -- src/modules/common/__tests__/localized-client-link.test.tsx
```

## Test Coverage

The tests cover:
- Component rendering with various props and states
- User interactions (clicks, focus, keyboard navigation)
- Business logic (price calculations, percentage discounts, currency formatting)
- Error handling and loading states
- Accessibility features
- Conditional rendering based on props
- Form input functionality and validation states

## Mocking

Tests use Jest mocks for:
- Medusa UI components and utilities
- Next.js navigation and routing
- Custom icons and components
- Data fetching functions
- Money formatting utilities

## Components Tested

### LocalizedClientLink
- Country code URL construction
- Props forwarding to Next.js Link
- Edge cases (null/undefined country codes)

### LineItemPrice & LineItemUnitPrice
- Price display with and without discounts
- Percentage discount calculations
- Unit price calculations (total ÷ quantity)
- Currency formatting
- Different display styles (default vs tight)

### CartTotals
- Display of all cart totals (subtotal, shipping, taxes, discount, total)
- Conditional discount rendering
- Null/undefined value handling
- Currency code application

### DeleteButton
- Loading state management during deletion
- Error handling (reset loading on failure)
- Icon switching (trash/spinner)
- Multiple click handling

### Input
- Password visibility toggle functionality
- Label display with required indicators
- Top label rendering
- Props forwarding and accessibility
- Focus management and keyboard navigation
- Different input types handling