# Products Module Tests

This directory contains unit tests for the products module components and templates.

## Test Files

### `product-template.test.tsx`
Tests the main ProductTemplate component that displays a single product with all related sections.
- Product container rendering
- Component section visibility (ImageGallery, ProductActions, ProductTabs, etc.)
- Error handling with `notFound()` when product is missing or has no ID
- Multiple image handling

**Tests**: 9

### `product-preview.test.tsx`
Tests the ProductPreview async component that renders product cards in listings.
- Link generation to product page
- Thumbnail and price display
- Product title rendering
- Featured product styling
- Region-based pricing calculation
- Graceful handling of missing thumbnails

**Tests**: 9

### `product-price.test.tsx`
Tests the ProductPrice component that displays product pricing information.
- Regular price display
- "From" prefix for price ranges
- Sale price display when variant is selected
- Price data attributes
- Graceful handling of missing prices with loading pulse animation

**Tests**: 7

### `thumbnail.test.tsx`
Tests the Thumbnail component that renders product images with proper sizing and aspect ratios.
- Image rendering from thumbnail prop
- Fallback to first image in images array
- Size variants (small, medium, large, full, square)
- Featured vs non-featured aspect ratios
- Custom className application
- data-testid prop handling

**Tests**: 12

### `product-tabs.test.tsx`
Tests the ProductTabs component that displays product information in tabbed format.
- Tabs container rendering
- Description tab display
- Product description content
- Tab switching functionality
- Multiple tabs for metadata
- Graceful handling of missing descriptions

**Tests**: 7

## Total Test Count

**Total Tests**: ~44 tests across 5 test files

## Running Tests

Run all products module tests:
```bash
npm test -- src/modules/products/__tests__
```

Run a specific test file:
```bash
npm test -- src/modules/products/__tests__/product-template.test.tsx
```

Run tests with coverage:
```bash
npm test -- --coverage src/modules/products/__tests__
```

## Mocking Strategy

### External Dependencies
- `@lib/util/get-product-price`: Mocked to return price objects with calculated_price and price_type
- `next/image`: Mocked to simple img element
- `next/navigation`: `notFound` function mocked to throw an error

### UI Components
- `@medusajs/ui` components (Container, Tabs, etc.): Mocked with React.createElement
- Icon components: Mocked to divs with data-testid attributes
- Module components: Mocked to divs with identifying data-testid

### Test Data
- HttpTypes.StoreProduct: Mock product objects with title, handle, description, thumbnail
- HttpTypes.StoreRegion: Mock region objects with id, name, currency_code
- HttpTypes.StoreProductImage: Mock image arrays with id and url

## Test Coverage Areas

- **Product Display**: ProductTemplate renders all sections correctly
- **Pricing**: ProductPrice shows correct pricing with sales and variants
- **Images**: Thumbnail handles multiple sizes and aspect ratios
- **Product Discovery**: ProductPreview works in listings
- **Information Display**: ProductTabs shows product details
- **Error Handling**: Missing products, images, and prices are handled gracefully
- **Props**: Custom className, data-testid, and other props are applied correctly
- **Accessibility**: Elements have proper roles and testid attributes

## Common Patterns

All tests follow these patterns:

1. **Mock Setup**: All external dependencies are mocked before component import
2. **Data Fixtures**: Mock products and regions are defined as constants
3. **Test Organization**: Tests are grouped by feature area
4. **Async Handling**: Suspense is mocked to simplify async component testing
5. **Isolation**: Each test is independent and uses beforeEach to clear mocks
