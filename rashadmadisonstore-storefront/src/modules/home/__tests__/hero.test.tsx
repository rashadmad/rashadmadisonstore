import React from 'react'
import { render, screen } from '@testing-library/react'

import Hero from '../components/hero'

jest.mock('@modules/common/components/localized-client-link', () => {
  return function MockLocalizedClientLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

describe('Hero component', () => {
  it('renders browse collections and donate buttons for signed-out users', () => {
    render(<Hero customer={null} hasLoggedInBefore={false} />)

    expect(screen.getByRole('link', { name: 'Browse Collection' })).toHaveAttribute(
      'href',
      '/collections'
    )

    expect(screen.getByRole('link', { name: 'Donate materials' })).toHaveAttribute(
      'href',
      'https://stripe.com/'
    )
  })

  it('shows Create an Account button for first-time signed-out users', () => {
    render(<Hero customer={null} hasLoggedInBefore={false} />)

    expect(screen.getByRole('link', { name: 'Create an Account' })).toHaveAttribute(
      'href',
      '/account?view=register'
    )
  })

  it('shows Sign back in button for previously signed-in signed-out users', () => {
    render(<Hero customer={null} hasLoggedInBefore={true} />)

    expect(screen.getByRole('link', { name: 'Sign back in' })).toHaveAttribute(
      'href',
      '/account?view=sign-in'
    )
  })

  it('hides signed-out CTA button for signed-in users', () => {
    const signedInCustomer = {
      id: 'customer_123',
      email: 'signedin@example.com',
    } as any

    render(<Hero customer={signedInCustomer} hasLoggedInBefore={true} />)

    expect(screen.queryByRole('link', { name: 'Create an Account' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Sign back in' })).not.toBeInTheDocument()
  })
})
