import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginTemplate, { LOGIN_VIEW } from '../templates/login-template'

// Mock the Login component
jest.mock('../components/login', () => {
  return function DummyComponent({ setCurrentView }: any) {
    return (
      <div data-testid="login-component">
        Login Component
        <button 
          data-testid="switch-to-register"
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
        >
          Switch to Register
        </button>
      </div>
    )
  }
})

// Mock the Register component
jest.mock('../components/register', () => {
  return function DummyComponent({ setCurrentView }: any) {
    return (
      <div data-testid="register-component">
        Register Component
        <button 
          data-testid="switch-to-login"
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
        >
          Switch to Login
        </button>
      </div>
    )
  }
})

describe('LoginTemplate Component', () => {
  it('should render the main container', () => {
    const { container } = render(<LoginTemplate />)
    const mainDiv = container.querySelector('.w-full')
    expect(mainDiv).toBeInTheDocument()
  })

  it('should render Login component by default', () => {
    render(<LoginTemplate />)
    expect(screen.getByTestId('login-component')).toBeInTheDocument()
  })

  it('should render Register component when initialView is REGISTER', () => {
    render(<LoginTemplate initialView={LOGIN_VIEW.REGISTER} />)
    expect(screen.getByTestId('register-component')).toBeInTheDocument()
  })

  it('should render Register component when switching views', () => {
    render(<LoginTemplate />)
    
    // Initially shows login
    expect(screen.getByTestId('login-component')).toBeInTheDocument()
    expect(screen.queryByTestId('register-component')).not.toBeInTheDocument()
    
    // Click to switch to register
    const switchButton = screen.getByTestId('switch-to-register')
    fireEvent.click(switchButton)
    
    // Now shows register
    expect(screen.queryByTestId('login-component')).not.toBeInTheDocument()
    expect(screen.getByTestId('register-component')).toBeInTheDocument()
  })

  it('should switch back from Register to Login', () => {
    render(<LoginTemplate />)
    
    // Switch to register
    const switchToRegisterButton = screen.getByTestId('switch-to-register')
    fireEvent.click(switchToRegisterButton)
    expect(screen.getByTestId('register-component')).toBeInTheDocument()
    
    // Switch back to login
    const switchToLoginButton = screen.getByTestId('switch-to-login')
    fireEvent.click(switchToLoginButton)
    expect(screen.getByTestId('login-component')).toBeInTheDocument()
  })

  it('should have correct container styling', () => {
    const { container } = render(<LoginTemplate />)
    const mainDiv = container.querySelector('.w-full')
    
    expect(mainDiv).toHaveClass('w-full')
    expect(mainDiv).toHaveClass('min-h-[60vh]')
    expect(mainDiv).toHaveClass('flex')
    expect(mainDiv).toHaveClass('items-center')
    expect(mainDiv).toHaveClass('justify-center')
    expect(mainDiv).toHaveClass('px-6')
    expect(mainDiv).toHaveClass('py-10')
  })

  it('should pass setCurrentView function to Login component', () => {
    render(<LoginTemplate />)
    
    // Verify that Login component is rendered with ability to change views
    expect(screen.getByTestId('login-component')).toBeInTheDocument()
    
    // Click the button to change views
    const switchButton = screen.getByTestId('switch-to-register')
    fireEvent.click(switchButton)
    
    // Verify view changed
    expect(screen.getByTestId('register-component')).toBeInTheDocument()
  })

  it('should pass setCurrentView function to Register component', () => {
    render(<LoginTemplate />)
    
    // Switch to register
    const switchToRegisterButton = screen.getByTestId('switch-to-register')
    fireEvent.click(switchToRegisterButton)
    
    // Verify that Register component is rendered with ability to change views
    expect(screen.getByTestId('register-component')).toBeInTheDocument()
    
    // Click the button to change views
    const switchToLoginButton = screen.getByTestId('switch-to-login')
    fireEvent.click(switchToLoginButton)
    
    // Verify view changed
    expect(screen.getByTestId('login-component')).toBeInTheDocument()
  })

  it('should display correct component based on currentView state', () => {
    render(<LoginTemplate />)
    
    // Test initial state
    expect(screen.getByText('Login Component')).toBeInTheDocument()
    
    // Switch to register
    fireEvent.click(screen.getByTestId('switch-to-register'))
    expect(screen.getByText('Register Component')).toBeInTheDocument()
  })

  it('should handle multiple view switches', () => {
    render(<LoginTemplate />)
    
    // First switch to register
    fireEvent.click(screen.getByTestId('switch-to-register'))
    expect(screen.getByTestId('register-component')).toBeInTheDocument()
    
    // Back to login
    fireEvent.click(screen.getByTestId('switch-to-login'))
    expect(screen.getByTestId('login-component')).toBeInTheDocument()
    
    // Forward to register again
    fireEvent.click(screen.getByTestId('switch-to-register'))
    expect(screen.getByTestId('register-component')).toBeInTheDocument()
  })
})
