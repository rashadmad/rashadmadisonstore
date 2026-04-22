import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AccountNav from '../components/account-nav'
import { HttpTypes } from '@medusajs/types'

// Mock usePathname and useParams
const mockUsePathname = jest.fn()
const mockUseParams = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useParams: () => mockUseParams(),
}))

// Mock the signout function
jest.mock('@lib/data/customer', () => ({
  signout: jest.fn(),
}))

// Mock icon components
jest.mock('@modules/common/icons/chevron-down', () => {
  return function DummyComponent() {
    return <div data-testid="chevron-down-icon" />
  }
})

jest.mock('@modules/common/icons/user', () => {
  return function DummyComponent() {
    return <div data-testid="user-icon" />
  }
})

jest.mock('@modules/common/icons/map-pin', () => {
  return function DummyComponent() {
    return <div data-testid="map-pin-icon" />
  }
})

jest.mock('@modules/common/icons/package', () => {
  return function DummyComponent() {
    return <div data-testid="package-icon" />
  }
})

// Mock medusajs/icons
jest.mock('@medusajs/icons', () => ({
  ArrowRightOnRectangle: () => <div data-testid="logout-icon" />,
}))

// Mock LocalizedClientLink
jest.mock('@modules/common/components/localized-client-link', () => {
  return function DummyComponent({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

describe('AccountNav Component', () => {
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

  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePathname.mockReturnValue('/en/account')
    mockUseParams.mockReturnValue({ countryCode: 'en' })
  })

  it('should render mobile account nav container', () => {
    render(<AccountNav customer={mockCustomer} />)
    expect(screen.getByTestId('mobile-account-nav')).toBeInTheDocument()
  })

  it('should render account nav element', () => {
    render(<AccountNav customer={mockCustomer} />)
    expect(screen.getByTestId('account-nav')).toBeInTheDocument()
  })

  it('should display welcome message with customer first name', () => {
    render(<AccountNav customer={mockCustomer} />)
    expect(screen.getByText(/Hello John/)).toBeInTheDocument()
  })

  it('should render profile link', () => {
    render(<AccountNav customer={mockCustomer} />)
    const profileLinks = screen.getAllByTestId('profile-link')
    expect(profileLinks.length).toBeGreaterThan(0)
  })

  it('should render addresses link', () => {
    render(<AccountNav customer={mockCustomer} />)
    const addressesLinks = screen.getAllByTestId('addresses-link')
    expect(addressesLinks.length).toBeGreaterThan(0)
  })

  it('should render orders link', () => {
    render(<AccountNav customer={mockCustomer} />)
    const ordersLinks = screen.getAllByTestId('orders-link')
    expect(ordersLinks.length).toBeGreaterThan(0)
  })

  it('should render logout buttons (mobile and desktop)', () => {
    render(<AccountNav customer={mockCustomer} />)
    const logoutButtons = screen.getAllByTestId('logout-button')
    expect(logoutButtons.length).toBeGreaterThan(0)
  })

  it('should have correct profile link href', () => {
    render(<AccountNav customer={mockCustomer} />)
    const profileLinks = screen.getAllByTestId('profile-link')
    expect(profileLinks[0]).toHaveAttribute('href', '/account/profile')
  })

  it('should have correct addresses link href', () => {
    render(<AccountNav customer={mockCustomer} />)
    const addressesLinks = screen.getAllByTestId('addresses-link')
    expect(addressesLinks[0]).toHaveAttribute('href', '/account/addresses')
  })

  it('should have correct orders link href', () => {
    render(<AccountNav customer={mockCustomer} />)
    const ordersLinks = screen.getAllByTestId('orders-link')
    expect(ordersLinks[0]).toHaveAttribute('href', '/account/orders')
  })

  it('should render icon elements', () => {
    render(<AccountNav customer={mockCustomer} />)
    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
    expect(screen.getByTestId('map-pin-icon')).toBeInTheDocument()
    expect(screen.getByTestId('package-icon')).toBeInTheDocument()
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument()
  })

  it('should call signout with correct country code on logout', async () => {
    const { signout } = require('@lib/data/customer')
    
    render(<AccountNav customer={mockCustomer} />)
    const logoutButtons = screen.getAllByTestId('logout-button')
    
    fireEvent.click(logoutButtons[0])
    
    await waitFor(() => {
      expect(signout).toHaveBeenCalledWith('en')
    })
  })

  it('should handle null customer', () => {
    const { container } = render(<AccountNav customer={null} />)
    expect(container).toBeInTheDocument()
  })

  it('should render Account link when not on account page', () => {
    mockUsePathname.mockReturnValue('/en/products')
    render(<AccountNav customer={mockCustomer} />)
    expect(screen.getByTestId('account-main-link')).toBeInTheDocument()
  })

  it('should call signout with different country codes', async () => {
    const { signout } = require('@lib/data/customer')
    mockUsePathname.mockReturnValue('/fr/account')
    mockUseParams.mockReturnValue({ countryCode: 'fr' })
    
    render(<AccountNav customer={mockCustomer} />)
    const logoutButtons = screen.getAllByTestId('logout-button')
    fireEvent.click(logoutButtons[0])
    
    await waitFor(() => {
      expect(signout).toHaveBeenCalledWith('fr')
    })
  })

  it('should have proper flex layout styling', () => {
    render(<AccountNav customer={mockCustomer} />)
    const profileLinks = screen.getAllByTestId('profile-link')
    expect(profileLinks[0]).toHaveClass('flex')
  })

  it('should not display Account main link when on account page', () => {
    mockUsePathname.mockReturnValue('/en/account')
    render(<AccountNav customer={mockCustomer} />)
    expect(screen.queryByTestId('account-main-link')).not.toBeInTheDocument()
  })

  it('should render Log out text', () => {
    render(<AccountNav customer={mockCustomer} />)
    const logOutElements = screen.getAllByText('Log out')
    expect(logOutElements.length).toBeGreaterThan(0)
  })
})
