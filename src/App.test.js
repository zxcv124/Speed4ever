import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

const renderRoute = route => render(
  <MemoryRouter initialEntries={[route]}>
    <App />
  </MemoryRouter>
);

test('renders cover page navigation for public visitors', () => {
  renderRoute('/');

  expect(screen.getByText(/login/i)).toBeInTheDocument();
  expect(screen.getByText(/car blogs/i)).toBeInTheDocument();
});

test('renders about page route', () => {
  renderRoute('/about-us');

  expect(screen.getByRole('heading', { name: /about speed4ever/i })).toBeInTheDocument();
  expect(screen.getByText(/car enthusiasts across the uae/i)).toBeInTheDocument();
});

test('renders contact page route', () => {
  renderRoute('/contact-us');

  expect(screen.getByRole('heading', { name: /contact speed4ever/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /email support/i })).toHaveAttribute(
    'href',
    expect.stringContaining('mailto:')
  );
});

test('falls back unknown public routes to cover page', () => {
  render(
    <MemoryRouter initialEntries={['/missing-route']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText(/login/i)).toBeInTheDocument();
});
