import React from 'react'
import { render, screen } from '@testing-library/react'
import AccountLayout from '../templates/account-layout'
import { HttpTypes } from '@medusajs/types'

// Mock the AccountNav component
jest.mock('../components/account-nav', () => {
  return function DummyComponent({ customer }: any) {
    return <div data-testid="account-nav">AccountNav - {customer?.first_name}</div>
  }
})

// Mock the UnderlineLink component
jest.mock('@modules/common/components/interactive-link', () => {
  return function DummyComponent({ children, href }: any) {
    return <a href={href}>{children}</a>
  }
})

describe('AccountLayout Component', () => {
  const mockCustomer: HttpTypes.StoreCustomer = {
    id: '1',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    phone: '123-456-7890',
    has_account: true,
    addresses: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  it('should render the account layout container with test id', () => {
    render(
      <AccountLayout customer={mockCustomer}>
        <div>Test Content</div>
      </AccountLayout>
    )
    
    expect(screen.getByTestId('account-page')).toBeInTheDocument()
  })

  it('should render AccountNav when customer is provided', () => {
    render(
      <AccountLayout customer={mockCustomer}>
        <div>Test Content</div>
      </AccountLayout>
    )
    
    expect(screen.getByTestId('account-nav')).toBeInTheDocument()
  })

  it('should not render AccountNav when customer is null', () => {
    render(
      <AccountLayout customer={null}>
        <div>Test Content</div>
      </AccountLayout>
    )
    
    expect(screen.queryByTestId('account-nav')).not.toBeInTheDocument()
  })

  it('should render children content', () => {
    render(
      <AccountLayout customer={mockCustomer}>
        <div>Custom Content Here</div>
      </AccountLayout>
    )
    
    expect(screen.getByText('Custom Content Here')).toBeInTheDocument()
  })

  it('should render customer service section', () => {
    render(
      <AccountLayout customer={mockCustomer}>
        <div>Test Content</div>
      </AccountLayout>
    )
    
    expect(screen.getByText('Got questions?')).toBeInTheDocument()
    expect(screen.getByText(/You can find frequently asked questions/)).toBeInTheDocument()
    expect(screen.getByText('Customer Service')).toBeInTheDocument()
  })

  it('should have responsive grid layout', () => {
    const { container } = render(
      <AccountLayout customer={mockCustomer}>
        <div>Test Content</div>
      </AccountLayout>
    )
    
    const grid = container.querySelector('.grid-cols-1')
    expect(grid).toBeInTheDocument()
    expect(grid).toHaveClass('small:grid-cols-[240px_1fr]')
  })

  it('should have correct styling classes applied', () => {
    const { container } = render(
      <AccountLayout customer={mockCustomer}>
        <div>Test Content</div>
      </AccountLayout>
    )
    
    const mainContainer = screen.getByTestId('account-page')
    expect(mainContainer).toHaveClass('flex-1', 'small:py-12')
  })
})
