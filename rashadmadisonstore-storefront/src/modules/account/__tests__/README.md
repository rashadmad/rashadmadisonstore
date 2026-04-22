# Account Module Tests

Comprehensive test suite for the Medusa Storefront account module components and templates.

## Test Files

### 1. **account-layout.test.tsx**
Tests for the main AccountLayout template component.

**Test Coverage:**
- Renders account page container with correct test ID
- Renders AccountNav when customer is provided
- Handles null customer gracefully (doesn't render nav)
- Renders children content correctly
- Displays customer service section with link
- Applies responsive grid layout
- Applies correct styling classes

**Key Components Tested:**
- AccountLayout template
- Mocked: AccountNav, UnderlineLink

### 2. **account-nav.test.tsx**
Tests for the AccountNav component that handles navigation and logout.

**Test Coverage:**
- Renders mobile navigation
- Displays welcome message with customer name
- Renders navigation links (Profile, Addresses, Orders)
- Renders logout button with icon
- Correct href attributes on links
- Icon rendering (User, MapPin, Package, ChevronDown)
- Logout functionality with correct country code
- Responsive visibility

**Key Features:**
- Navigation routing
- User logout flow
- Icon integration
- Mobile/desktop responsive behavior

### 3. **login.test.tsx**
Tests for the Login component used in authentication flow.

**Test Coverage:**
- Renders login page container
- Displays welcome and description messages
- Renders email and password input fields
- Renders sign-in button
- Renders register switch button
- Calls setCurrentView with LOGIN_VIEW.REGISTER
- Displays "Not a member?" prompt
- Form element present
- Correct styling classes

**Key Features:**
- Form validation setup
- Error message display
- View switching logic

### 4. **register.test.tsx**
Tests for the Register component for new user registration.

**Test Coverage:**
- Renders register page container
- Displays title and description
- Renders all input fields (first name, last name, email, phone, password)
- Renders join button
- Displays privacy policy and terms of use links
- Switches to sign-in view when requested
- Form element present
- Required input attributes

**Key Features:**
- Multi-field form handling
- Legal links display
- View switching between login/register
- Input field validation setup

### 5. **login-template.test.tsx**
Tests for the LoginTemplate component that manages Login/Register view switching.

**Test Coverage:**
- Renders main container with correct styling
- Shows Login component by default
- Switches to Register view
- Switches back to Login view
- Handles multiple view switches
- Passes setCurrentView function to child components
- Correct layout styling (flex, padding, etc.)

**Key Features:**
- View state management
- Component switching logic
- Layout/styling consistency

### 6. **account-info.test.tsx**
Tests for the AccountInfo reusable component for displaying/editing account information.

**Test Coverage:**
- Renders with correct test ID
- Displays label and current info
- Shows Edit/Cancel button
- Renders children (form inputs)
- Displays success messages with badge
- Displays error messages with customizable text
- Handles button clicks
- Calls clearState on edit
- Correct container styling

**Key Features:**
- Edit mode toggling
- Success/error state management
- Disclosure animations (mocked)
- Form status awareness

### 7. **overview.test.tsx**
Tests for the Overview component showing customer profile dashboard.

**Test Coverage:**
- Renders overview page wrapper
- Displays welcome message with customer name
- Shows signed-in email
- Displays profile completion percentage
- Shows saved addresses count (0 or multiple)
- Displays recent orders (max 5)
- Order details: date, ID, total amount
- Handles null/empty customer and orders
- Links to order details pages
- Column headers: "Date placed", "Order number", "Total amount"

**Key Features:**
- Customer profile dashboard
- Profile completion calculation
- Address count display
- Recent orders listing with pagination
- Responsive layout

## Running Tests

### Run all account module tests:
```bash
npm test -- src/modules/account/__tests__
```

### Run a specific test file:
```bash
npm test -- src/modules/account/__tests__/login.test.tsx
```

### Run tests in watch mode:
```bash
npm test:watch -- src/modules/account/__tests__
```

### Generate coverage report:
```bash
npm test:coverage -- src/modules/account/__tests__
```

## Test Structure

All tests follow this pattern:
1. **Imports** - React, testing utilities, and components
2. **Mocks** - Mock Next.js navigation, API calls, child components
3. **Test Suite** - Describe block with related tests
4. **Setup** - BeforeEach hooks for test initialization
5. **Assertions** - Verify component behavior and rendering

## Mocking Strategy

### Next.js Navigation
- `usePathname()` - Mocked to return specific paths
- `useParams()` - Mocked to return country code

### API/Data Functions
- `login()` - Mocked from `@lib/data/customer`
- `signup()` - Mocked from `@lib/data/customer`
- `signout()` - Mocked from `@lib/data/customer`

### UI Components
- Icons - Mocked as simple divs with test IDs
- Form inputs - Mocked with data-testid attributes
- Links - Mocked as anchor tags

## Dependencies

- `@testing-library/react` - Component testing
- `@testing-library/jest-dom` - DOM matchers
- `jest` - Test runner
- `@medusajs/types` - TypeScript types for mocking

## Best Practices Used

1. **Test IDs** - Components already have data-testid attributes
2. **User-centric Testing** - Tests focus on user interactions
3. **Accessibility** - Uses semantic HTML queries where possible
4. **Mock Management** - Clears mocks between tests
5. **Descriptive Names** - Clear test descriptions for maintainability
6. **Grouped Tests** - Related tests in focused describe blocks

## Adding New Tests

When adding tests for new components:

1. Create a new `.test.tsx` file in `__tests__/` directory
2. Mock all dependencies (Next.js, API calls, child components)
3. Create a describe block for the component
4. Add beforeEach to clear mocks
5. Write tests following the pattern of existing tests
6. Include tests for:
   - Rendering
   - User interactions
   - Conditional rendering
   - Props handling
   - Error states

## Troubleshooting

### Common Issues

**"Cannot find module" errors**
- Ensure all imports match the actual file paths
- Check alias configuration in `jest.config.js`

**"Warning: ReactDOM.render"**
- This is normal for React 19, ignore or suppress

**Mocks not working**
- Ensure mocks are defined before component imports
- Verify mock paths match actual module paths

**Test timeouts**
- Increase timeout: `jest.setTimeout(10000)`
- Check for missing async/await

