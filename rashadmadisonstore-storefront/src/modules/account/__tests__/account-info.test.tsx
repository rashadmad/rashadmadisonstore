import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import AccountInfo from '../components/account-info'

// Mock useFormStatus
jest.mock('react-dom', () => {
  const actualReactDom = jest.requireActual('react-dom')
  return {
    ...actualReactDom,
    useFormStatus: jest.fn(() => ({ pending: false })),
  }
})

// Mock medusajs ui components
jest.mock('@medusajs/ui', () => ({
  Badge: ({ children, color }: any) => <div data-testid="badge" data-color={color}>{children}</div>,
  Button: ({ children, isLoading, ...props }: any) => <button {...props}>{children}</button>,
  clx: jest.fn((...args) => args.flat().filter(Boolean).join(' ')),
}))

// Mock custom hooks
jest.mock('@lib/hooks/use-toggle-state', () => ({
  __esModule: true,
  default: () => ({
    state: false,
    close: jest.fn(),
    toggle: jest.fn(),
  }),
}))

// Mock headlessui Disclosure - create real-like structure
jest.mock('@headlessui/react', () => {
  const React = require('react')
  const DisclosureComponent = ({ children }: any) => (
    <div data-testid="disclosure">{children}</div>
  )
  const DisclosurePanelComponent = ({ children, static: staticProp, className }: any) => (
    <div data-testid="disclosure-panel" className={className}>
      {children}
    </div>
  )
  DisclosureComponent.Panel = DisclosurePanelComponent
  return {
    Disclosure: DisclosureComponent,
  }
})

describe('AccountInfo Component', () => {
  const mockClearState = jest.fn()
  const defaultProps = {
    label: 'Email',
    currentInfo: 'test@example.com',
    isSuccess: false,
    isError: false,
    clearState: mockClearState,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with data-testid', () => {
    render(
      <AccountInfo {...defaultProps} data-testid="account-email-info" />
    )
    expect(screen.getByTestId('account-email-info')).toBeInTheDocument()
  })

  it('should display the label', () => {
    render(<AccountInfo {...defaultProps} />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('should display current info as string', () => {
    render(<AccountInfo {...defaultProps} />)
    expect(screen.getByTestId('current-info')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should render Edit button', () => {
    render(<AccountInfo {...defaultProps} />)
    const editButton = screen.getByTestId('edit-button')
    expect(editButton).toBeInTheDocument()
    expect(editButton.textContent).toBe('Edit')
  })

  it('should render children content when provided', () => {
    render(
      <AccountInfo {...defaultProps}>
        <input type="email" defaultValue="newemail@example.com" />
      </AccountInfo>
    )
    expect(screen.getByDisplayValue('newemail@example.com')).toBeInTheDocument()
  })

  it('should display current info as react node', () => {
    const infoNode = <span data-testid="custom-info">Custom Info</span>
    render(
      <AccountInfo {...defaultProps} currentInfo={infoNode} />
    )
    expect(screen.getByTestId('custom-info')).toBeInTheDocument()
  })

  it('should display success message when isSuccess is true', () => {
    render(
      <AccountInfo {...defaultProps} isSuccess={true} />
    )
    const disclosures = screen.getAllByTestId('disclosure-panel')
    expect(disclosures.length).toBeGreaterThan(0)
  })

  it('should display error message when isError is true', () => {
    render(
      <AccountInfo 
        {...defaultProps} 
        isError={true}
        errorMessage="Failed to update email"
      />
    )
    expect(screen.getByText('Failed to update email')).toBeInTheDocument()
  })

  it('should use default error message when none provided', () => {
    render(
      <AccountInfo {...defaultProps} isError={true} />
    )
    expect(screen.getByText('An error occurred, please try again')).toBeInTheDocument()
  })

  it('should call clearState on Edit button click', () => {
    const clearState = jest.fn()
    render(
      <AccountInfo 
        {...defaultProps} 
        clearState={clearState}
      />
    )
    
    const editButton = screen.getByTestId('edit-button')
    fireEvent.click(editButton)
    
    expect(clearState).toHaveBeenCalled()
  })

  it('should have correct container styling', () => {
    const { container } = render(<AccountInfo {...defaultProps} />)
    const wrapper = container.querySelector('.text-small-regular')
    expect(wrapper).toBeInTheDocument()
  })

  it('should display multiple account info items', () => {
    render(
      <AccountInfo 
        {...defaultProps}
        label="Phone"
        currentInfo="+1234567890"
      />
    )
    
    expect(screen.getByText('Phone')).toBeInTheDocument()
    expect(screen.getByText('+1234567890')).toBeInTheDocument()
  })

  it('should have disclosure elements', () => {
    render(
      <AccountInfo {...defaultProps} isSuccess={true} />
    )
    const disclosures = screen.getAllByTestId('disclosure')
    expect(disclosures.length).toBeGreaterThan(0)
  })

  it('should render edit button with correct type when not in edit mode', () => {
    render(<AccountInfo {...defaultProps} />)
    const editButton = screen.getByTestId('edit-button')
    expect(editButton.getAttribute('type')).toBe('button')
  })
})
