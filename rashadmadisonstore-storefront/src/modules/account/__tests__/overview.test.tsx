import React from 'react'
import { render, screen } from '@testing-library/react'
import Overview from '../components/overview'
import { HttpTypes } from '@medusajs/types'

// Mock the Container component
jest.mock('@medusajs/ui', () => ({
  Container: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

// Mock the ChevronDown icon
jest.mock('@modules/common/icons/chevron-down', () => {
  return function DummyComponent() {
    return <div data-testid="chevron-down-icon" />
  }
})

// Mock LocalizedClientLink
jest.mock('@modules/common/components/localized-client-link', () => {
  return function DummyComponent({ children, href }: any) {
    return <a href={href}>{children}</a>
  }
})

// Mock money utility
jest.mock('@lib/util/money', () => ({
  convertToLocale: jest.fn((value) => `$${value}`),
}))

describe('Overview Component', () => {
  const mockCustomer: HttpTypes.StoreCustomer = {
    id: '1',
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
    phone: '123-456-7890',
    has_account: true,
    addresses: [
      {
        id: 'addr1',
        first_name: 'John',
        last_name: 'Doe',
        company: null,
        address_1: '123 Main St',
        address_2: null,
        city: 'New York',
        province: 'NY',
        postal_code: '10001',
        country_code: 'US',
        phone: '123-456-7890',
        is_default_billing: true,
        is_default_shipping: true,
      },
      {
        id: 'addr2',
        first_name: 'John',
        last_name: 'Doe',
        company: null,
        address_1: '456 Oak Ave',
        address_2: null,
        city: 'Los Angeles',
        province: 'CA',
        postal_code: '90001',
        country_code: 'US',
        phone: '123-456-7890',
        is_default_billing: false,
        is_default_shipping: false,
      },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const mockOrders: HttpTypes.StoreOrder[] = [
    {
      id: 'order1',
      display_id: 100001,
      created_at: new Date('2024-01-15').toISOString(),
      updated_at: new Date('2024-01-15').toISOString(),
      customer_id: '1',
      total: 15000,
      subtotal: 12000,
      tax_total: 3000,
      currency_code: 'USD',
      region_id: 'region1',
    },
    {
      id: 'order2',
      display_id: 100002,
      created_at: new Date('2024-02-20').toISOString(),
      updated_at: new Date('2024-02-20').toISOString(),
      customer_id: '1',
      total: 25000,
      subtotal: 20000,
      tax_total: 5000,
      currency_code: 'USD',
      region_id: 'region1',
    },
  ]

  it('should render overview page wrapper', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    expect(screen.getByTestId('overview-page-wrapper')).toBeInTheDocument()
  })

  it('should display welcome message with customer first name', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    const welcomeMessage = screen.getByTestId('welcome-message')
    expect(welcomeMessage).toBeInTheDocument()
    expect(welcomeMessage).toHaveTextContent('Hello John')
  })

  it('should display signed in email', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    const emailDisplay = screen.getByTestId('customer-email')
    expect(emailDisplay).toBeInTheDocument()
    expect(emailDisplay).toHaveTextContent('john@example.com')
  })

  it('should display profile section header', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('should display profile completion percentage', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    const profileCompletion = screen.getByTestId('customer-profile-completion')
    expect(profileCompletion).toBeInTheDocument()
  })

  it('should display addresses section header', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    const allAddresses = screen.getAllByText('Addresses')
    expect(allAddresses.length).toBeGreaterThan(0)
  })

  it('should display saved addresses count', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    const addressesCount = screen.getByTestId('addresses-count')
    expect(addressesCount).toBeInTheDocument()
    expect(addressesCount).toHaveTextContent('2')
  })

  it('should display zero addresses when customer has none', () => {
    const customerNoAddresses = { ...mockCustomer, addresses: [] }
    render(<Overview customer={customerNoAddresses} orders={mockOrders} />)
    const addressesCount = screen.getByTestId('addresses-count')
    expect(addressesCount).toHaveTextContent('0')
  })

  it('should display recent orders header', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    expect(screen.getByText('Recent orders')).toBeInTheDocument()
  })

  it('should render orders wrapper', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    expect(screen.getByTestId('orders-wrapper')).toBeInTheDocument()
  })

  it('should display order items', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    const orderWrappers = screen.getAllByTestId('order-wrapper')
    expect(orderWrappers.length).toBe(2)
  })

  it('should display order creation dates', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    const createdDates = screen.getAllByTestId('order-created-date')
    expect(createdDates.length).toBe(2)
  })

  it('should display order IDs', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    const orderIds = screen.getAllByTestId('order-id')
    expect(orderIds.length).toBe(2)
  })

  it('should display date placed label', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    expect(screen.getAllByText('Date placed').length).toBe(2)
  })

  it('should display order number label', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    expect(screen.getAllByText('Order number').length).toBe(2)
  })

  it('should display total amount label', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    expect(screen.getAllByText('Total amount').length).toBe(2)
  })

  it('should handle null customer gracefully', () => {
    render(<Overview customer={null} orders={mockOrders} />)
    expect(screen.getByTestId('overview-page-wrapper')).toBeInTheDocument()
  })

  it('should handle null orders gracefully', () => {
    render(<Overview customer={mockCustomer} orders={null} />)
    expect(screen.getByTestId('overview-page-wrapper')).toBeInTheDocument()
  })

  it('should handle empty orders array', () => {
    render(<Overview customer={mockCustomer} orders={[]} />)
    expect(screen.getByTestId('orders-wrapper')).toBeInTheDocument()
  })

  it('should display completed text in profile section', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('should display saved text in addresses section', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('should render orders with links', () => {
    render(<Overview customer={mockCustomer} orders={mockOrders} />)
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThanOrEqual(2)
  })

  it('should show max 5 recent orders when more exist', () => {
    const manyOrders = Array.from({ length: 10 }, (_, i) => ({
      ...mockOrders[0],
      id: `order${i}`,
      display_id: 100000 + i,
    }))
    
    render(<Overview customer={mockCustomer} orders={manyOrders} />)
    const orderWrappers = screen.getAllByTestId('order-wrapper')
    expect(orderWrappers.length).toBe(5)
  })
})
