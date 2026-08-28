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
  it('renders browse gallery and donate buttons for signed-out users', () => {
    render(<Hero customer={null} hasLoggedInBefore={false} />)

    expect(screen.getByRole('link', { name: 'Browse Gallery' })).toHaveAttribute(
      'href',
      '/gallery'
    )

    expect(screen.getByRole('link', { name: 'Donate resources' })).toHaveAttribute(
      'href',
      'https://buy.stripe.com/aFa8wQ0fV4bAa509rJ0RG0d'
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

  it('links hero artwork images to their product pages', () => {
    render(<Hero customer={null} hasLoggedInBefore={false} />)

    expect(screen.getByRole('link', { name: 'African Sunset' })).toHaveAttribute(
      'href',
      '/products/african-sunset'
    )
    expect(screen.getByRole('link', { name: 'African Princess red' })).toHaveAttribute(
      'href',
      '/products/african-princess-red'
    )
    expect(screen.getByRole('link', { name: 'Tender Head' })).toHaveAttribute(
      'href',
      '/products/tender-head'
    )
    expect(screen.getByRole('link', { name: 'Prince' })).toHaveAttribute(
      'href',
      '/products/prince'
    )
    expect(screen.getByRole('link', { name: 'Zulu Husband' })).toHaveAttribute(
      'href',
      '/products/zulu-husband'
    )
  })

  it('uses the local ZuluMan image for the Zulu Husband artwork', () => {
    render(<Hero customer={null} hasLoggedInBefore={false} />)

    expect(screen.getByAltText('Zulu Husband')).toHaveAttribute(
      'src',
      '/images/ZuluMan.jpeg'
    )
    expect(screen.getByAltText('Zulu Husband')).toHaveClass('zulu-husband-frame-image')
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
