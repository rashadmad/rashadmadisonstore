import React from 'react'
import { render, screen } from '@testing-library/react'
import { HttpTypes } from '@medusajs/types'

import Nav from '../templates/nav'

jest.mock('@lib/data/regions', () => ({
  listRegions: jest.fn(async () => []),
}))

jest.mock('@lib/data/locales', () => ({
  listLocales: jest.fn(async () => []),
}))

jest.mock('@lib/data/locale-actions', () => ({
  getLocale: jest.fn(async () => null),
}))

jest.mock('@modules/layout/components/side-menu', () => {
  return function MockSideMenu() {
    return <div data-testid="side-menu" />
  }
})

jest.mock('@modules/layout/components/cart-button', () => {
  return function MockCartButton() {
    return <div data-testid="cart-button">Cart (0)</div>
  }
})

jest.mock('@modules/common/components/localized-client-link', () => {
  return function MockLocalizedClientLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

describe('Nav social icon links', () => {
  const signedOutCustomer = null

  const mockCustomer = {
    id: 'customer-1',
    email: 'test@example.com',
  } as HttpTypes.StoreCustomer

  it('renders Instagram and Facebook icon links in header', async () => {
    render(await Nav({ customer: signedOutCustomer, hasLoggedInBefore: false }))

    expect(screen.getByLabelText('Instagram')).toHaveAttribute(
      'href',
      'https://www.instagram.com/rashaddraws/'
    )

    expect(screen.getByLabelText('Facebook')).toHaveAttribute(
      'href',
      'https://www.facebook.com/rashad.madison.1/'
    )
  })

  it('shows Sign up for first-time signed-out users', async () => {
    render(await Nav({ customer: signedOutCustomer, hasLoggedInBefore: false }))

    expect(screen.getByTestId('nav-account-link')).toHaveTextContent('Sign up')
  })

  it('shows Sign in for returning signed-out users', async () => {
    render(await Nav({ customer: signedOutCustomer, hasLoggedInBefore: true }))

    expect(screen.getByTestId('nav-account-link')).toHaveTextContent('Sign in')
  })

  it('shows Account when customer is signed in', async () => {
    render(await Nav({ customer: mockCustomer, hasLoggedInBefore: true }))

    expect(screen.getByTestId('nav-account-link')).toHaveTextContent('Account')
  })
})
