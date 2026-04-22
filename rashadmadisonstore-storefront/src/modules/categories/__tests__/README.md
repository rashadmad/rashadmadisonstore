# Categories Module Tests

This directory contains unit tests for the categories module templates.

## Test Files

- `category-template.test.tsx` - Tests for the category template component

## Test Coverage

The tests cover:
- Component rendering with category data
- Breadcrumb navigation for parent categories
- Conditional rendering of descriptions and child categories
- Integration with refinement list and paginated products
- Error handling for missing data (null category, missing countryCode)

## Running Tests

```bash
# Run all categories tests
npm test -- src/modules/categories/__tests__

# Run specific test file
npm test -- src/modules/categories/__tests__/category-template.test.tsx
```

## Mocking

Tests use Jest mocks for:
- Next.js navigation functions
- React Suspense
- Common UI components
- Store components (refinement list, paginated products)
- Skeleton components