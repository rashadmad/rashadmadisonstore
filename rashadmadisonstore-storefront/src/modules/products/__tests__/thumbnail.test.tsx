import React from 'react'
import { render, screen } from '@testing-library/react'
import Thumbnail from '../components/thumbnail'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => React.createElement('img', { src, alt, ...props }),
}))

// Mock UI components
jest.mock('@medusajs/ui', () => ({
  Container: ({ children, className, ...props }: any) => React.createElement('div', { className, ...props }, children),
  clx: jest.fn((...args) => args.filter(Boolean).join(' ')),
}))

// Mock placeholder icon
jest.mock('@modules/common/icons/placeholder-image', () => ({
  __esModule: true,
  default: () => React.createElement('div', { 'data-testid': 'placeholder-icon' }, 'Placeholder'),
}))

describe('Thumbnail', () => {
  it('should render container', () => {
    const { container } = render(React.createElement(Thumbnail, { thumbnail: 'image.jpg' }))
    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should render image when thumbnail is provided', () => {
    render(React.createElement(Thumbnail, { thumbnail: 'image.jpg' }))
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'image.jpg')
  })

  it('should use first image from images array if no thumbnail', () => {
    const images = [{ url: 'first.jpg' }, { url: 'second.jpg' }]
    render(React.createElement(Thumbnail, { images, thumbnail: null }))
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'first.jpg')
  })

  it('should prefer thumbnail over images array', () => {
    const images = [{ url: 'first.jpg' }]
    render(React.createElement(Thumbnail, { thumbnail: 'thumbnail.jpg', images }))
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', 'thumbnail.jpg')
  })

  it('should apply featured size styling', () => {
    const { container } = render(React.createElement(Thumbnail, { thumbnail: 'image.jpg', isFeatured: true }))
    const div = container.querySelector('div')
    expect(div?.className).toContain('aspect-[11/14]')
  })

  it('should apply small size styling by default', () => {
    const { container } = render(React.createElement(Thumbnail, { thumbnail: 'image.jpg', size: 'small' }))
    const div = container.querySelector('div')
    expect(div?.className).toContain('w-[180px]')
  })

  it('should apply medium size styling', () => {
    const { container } = render(React.createElement(Thumbnail, { thumbnail: 'image.jpg', size: 'medium' }))
    const div = container.querySelector('div')
    expect(div?.className).toContain('w-[290px]')
  })

  it('should apply large size styling', () => {
    const { container } = render(React.createElement(Thumbnail, { thumbnail: 'image.jpg', size: 'large' }))
    const div = container.querySelector('div')
    expect(div?.className).toContain('w-[440px]')
  })

  it('should apply square aspect ratio', () => {
    const { container } = render(React.createElement(Thumbnail, { thumbnail: 'image.jpg', size: 'square' }))
    const div = container.querySelector('div')
    expect(div?.className).toContain('aspect-[1/1]')
  })

  it('should apply custom className', () => {
    const { container } = render(React.createElement(Thumbnail, { thumbnail: 'image.jpg', className: 'custom-class' }))
    const div = container.querySelector('div')
    expect(div?.className).toContain('custom-class')
  })

  it('should apply data-testid when provided', () => {
    render(React.createElement(Thumbnail, { thumbnail: 'image.jpg', 'data-testid': 'product-thumbnail' }))
    expect(screen.getByTestId('product-thumbnail')).toBeInTheDocument()
  })

  it('should handle non-featured product aspect ratio', () => {
    const { container } = render(React.createElement(Thumbnail, { thumbnail: 'image.jpg', isFeatured: false, size: 'medium' }))
    const div = container.querySelector('div')
    expect(div?.className).toContain('aspect-[9/16]')
  })

  it('should handle full width size', () => {
    const { container } = render(React.createElement(Thumbnail, { thumbnail: 'image.jpg', size: 'full' }))
    const div = container.querySelector('div')
    expect(div?.className).toContain('w-full')
  })
})
