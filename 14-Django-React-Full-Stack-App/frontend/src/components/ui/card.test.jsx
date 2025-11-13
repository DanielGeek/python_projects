import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card'

describe('Card Components', () => {
  describe('Card', () => {
    test('renders card with default styling', () => {
      render(<Card>Card content</Card>)
      
      const card = screen.getByText('Card content')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm')
    })

    test('applies custom className', () => {
      render(<Card className="custom-class">Card content</Card>)
      
      const card = screen.getByText('Card content')
      expect(card).toHaveClass('custom-class')
    })

    test('forwards ref correctly', () => {
      const ref = { current: null }
      
      render(<Card ref={ref}>Card content</Card>)
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
      expect(ref.current).toBe(screen.getByText('Card content'))
    })
  })

  describe('CardHeader', () => {
    test('renders card header with default styling', () => {
      render(<CardHeader>Header content</CardHeader>)
      
      const header = screen.getByText('Header content')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })

    test('applies custom className', () => {
      render(<CardHeader className="custom-class">Header content</CardHeader>)
      
      const header = screen.getByText('Header content')
      expect(header).toHaveClass('custom-class')
    })
  })

  describe('CardTitle', () => {
    test('renders card title with default styling', () => {
      render(<CardTitle>Card Title</CardTitle>)
      
      const title = screen.getByText('Card Title')
      expect(title).toBeInTheDocument()
      expect(title.tagName).toBe('H3')
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
    })

    test('applies custom className', () => {
      render(<CardTitle className="custom-class">Card Title</CardTitle>)
      
      const title = screen.getByText('Card Title')
      expect(title).toHaveClass('custom-class')
    })
  })

  describe('CardDescription', () => {
    test('renders card description with default styling', () => {
      render(<CardDescription>Card description</CardDescription>)
      
      const description = screen.getByText('Card description')
      expect(description).toBeInTheDocument()
      expect(description.tagName).toBe('P')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    test('applies custom className', () => {
      render(<CardDescription className="custom-class">Card description</CardDescription>)
      
      const description = screen.getByText('Card description')
      expect(description).toHaveClass('custom-class')
    })
  })

  describe('CardContent', () => {
    test('renders card content with default styling', () => {
      render(<CardContent>Content</CardContent>)
      
      const content = screen.getByText('Content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('p-6', 'pt-0')
    })

    test('applies custom className', () => {
      render(<CardContent className="custom-class">Content</CardContent>)
      
      const content = screen.getByText('Content')
      expect(content).toHaveClass('custom-class')
    })
  })

  describe('CardFooter', () => {
    test('renders card footer with default styling', () => {
      render(<CardFooter>Footer content</CardFooter>)
      
      const footer = screen.getByText('Footer content')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
    })

    test('applies custom className', () => {
      render(<CardFooter className="custom-class">Footer content</CardFooter>)
      
      const footer = screen.getByText('Footer content')
      expect(footer).toHaveClass('custom-class')
    })
  })

  describe('Complete Card Structure', () => {
    test('renders complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Footer Button</button>
          </CardFooter>
        </Card>
      )

      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Card content goes here')).toBeInTheDocument()
      expect(screen.getByText('Footer Button')).toBeInTheDocument()
    })

    test('card structure has proper semantic hierarchy', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      )

      const title = screen.getByRole('heading', { name: 'Title' })
      expect(title.tagName).toBe('H3')

      const description = screen.getByText('Description')
      expect(description.tagName).toBe('P')
    })

    test('all components forward refs correctly', () => {
      const refs = {
        card: { current: null },
        header: { current: null },
        title: { current: null },
        description: { current: null },
        content: { current: null },
        footer: { current: null },
      }

      render(
        <Card ref={refs.card}>
          <CardHeader ref={refs.header}>
            <CardTitle ref={refs.title}>Title</CardTitle>
            <CardDescription ref={refs.description}>Description</CardDescription>
          </CardHeader>
          <CardContent ref={refs.content}>Content</CardContent>
          <CardFooter ref={refs.footer}>Footer</CardFooter>
        </Card>
      )

      expect(refs.card.current).toBeInstanceOf(HTMLDivElement)
      expect(refs.header.current).toBeInstanceOf(HTMLDivElement)
      expect(refs.title.current).toBeInstanceOf(HTMLHeadingElement)
      expect(refs.description.current).toBeInstanceOf(HTMLParagraphElement)
      expect(refs.content.current).toBeInstanceOf(HTMLDivElement)
      expect(refs.footer.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})
