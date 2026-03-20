import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: false }),
    status: 200,
  }) as unknown as typeof fetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(document.querySelector('.App')).toBeInTheDocument();
  });

  it('shows footer beian link', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /沪ICP备/ })).toBeInTheDocument();
  });
});
