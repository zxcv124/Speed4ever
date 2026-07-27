import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('renders cover page navigation', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText(/login/i)).toBeInTheDocument();
  expect(screen.getByText(/car blogs/i)).toBeInTheDocument();
});
