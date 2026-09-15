import { fireEvent, render, screen } from '@testing-library/react'

import SideMenu from '../components/side-menu'

jest.mock('next/navigation', () => ({
  useParams: () => ({ countryCode: 'us' }),
}))

describe('SideMenu', () => {
  it('includes the About, Blog, and Store pages in the side panel navigation', () => {
    render(<SideMenu regions={null} locales={null} currentLocale={null} />)

    fireEvent.click(screen.getByTestId('nav-menu-button'))

    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/us/about')
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/us/blog')
    expect(screen.getByRole('link', { name: 'Store' })).toHaveAttribute('href', '/us/store')
  })
})
