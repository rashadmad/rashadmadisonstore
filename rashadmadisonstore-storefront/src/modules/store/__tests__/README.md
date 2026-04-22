# Store Module Tests

This directory contains unit tests for the store module components and templates.

## Test Files

### `store-template.test.tsx`
Tests for the main StoreTemplate component that renders the store page layout.
- Tests default props and page rendering
- Tests custom sortBy and page parameters
- Tests component layout and data-testid attributes
- Mocks RefinementList and PaginatedProducts components

### `paginated-products.test.tsx`
Tests for the PaginatedProducts server component that handles product listing with pagination.
- Tests product rendering and data fetching
- Tests pagination logic (when to show/hide pagination)
- Tests query parameter handling (collectionId, categoryId, productsIds, sortBy)
- Tests region fetching and error handling
- Mocks data functions and ProductPreview component

### `refinement-list.test.tsx`
Tests for the RefinementList component that provides sorting and filtering options.
- Tests Next.js navigation integration
- Tests query string creation and URL updates
- Tests data-testid prop passing
- Mocks SortProducts component and navigation hooks

### `sort-products.test.tsx`
Tests for the SortProducts component that handles product sorting options.
- Tests sort option rendering and selection
- Tests change handling and callback invocation
- Tests data-testid prop passing
- Mocks FilterRadioGroup component

### `pagination.test.tsx`
Tests for the Pagination component that handles page navigation.
- Tests page button rendering for different scenarios
- Tests pagination logic for various page counts
- Tests Next.js navigation integration
- Tests URL parameter handling and preservation

## Running Tests

```bash
# Run all store tests
npm test -- src/modules/store/__tests__

# Run specific test file
npm test -- src/modules/store/__tests__/store-template.test.tsx

# Run with coverage
npm test -- --coverage src/modules/store/__tests__
```

## Test Coverage

These tests cover:
- Component rendering and props handling
- User interactions and event handling
- Navigation and URL manipulation
- Data fetching and API integration
- Error handling and edge cases
- Responsive design classes
- Accessibility attributes

## Mock Strategy

The tests use comprehensive mocking to isolate components:
- Next.js navigation hooks (useRouter, usePathname, useSearchParams)
- Data fetching functions (listProductsWithSort, getRegion)
- Child components (ProductPreview, FilterRadioGroup, etc.)
- Utility functions and external dependencies

This ensures tests are fast, reliable, and focused on component logic rather than external dependencies.