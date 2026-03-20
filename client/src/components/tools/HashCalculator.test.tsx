import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HashCalculator from './HashCalculator';

describe('HashCalculator', () => {
  it('renders title and algorithm select', () => {
    render(
      <MemoryRouter>
        <HashCalculator />
      </MemoryRouter>
    );
    expect(screen.getByText(/哈希（SHA）/)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /计算哈希/ })).toBeInTheDocument();
  });
});
