import React from 'react'
import { render, screen } from '@testing-library/react'

import Footer from '../templates/footer'

jest.mock('@lib/data/categories', () => ({
  listCategories: jest.fn(async () => []),
}))

jest.mock('@lib/data/collections', () => ({
  listCollections: jest.fn(async () => ({ collections: [] })),
}))

jest.mock('@modules/common/components/localized-client-link', () => {
  return function MockLocalizedClientLink({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

jest.mock('@modules/layout/components/medusa-cta', () => {
  return function MockMedusaCTA() {
    return <div data-testid="medusa-cta" />
  }
})

describe('Footer social icon links', () => {
  it('renders Instagram and Facebook icon links in footer', async () => {
    render(await Footer())

    expect(screen.getByLabelText('Instagram')).toHaveAttribute(
      'href',
      'https://www.instagram.com/rashaddraws/'
    )

    expect(screen.getByLabelText('Facebook')).toHaveAttribute(
      'href',
      'https://www.facebook.com/rashad.madison.1/'
    )
  })
})
