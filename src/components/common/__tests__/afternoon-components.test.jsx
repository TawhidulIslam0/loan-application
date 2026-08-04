import React from 'react';
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CurrencyInput } from '../CurrencyInput';
import { MaskedInput } from '../MaskedInput';
import { ErrorMessage } from '../ErrorMessage';

describe('Afternoon Form Components', () => {
  test('renders CurrencyInput component with INR symbol and formatting', () => {
    render(<CurrencyInput label="Amount" value="100000" name="amount" />);
    
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('₹')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('1,00,000');
  });

  test('renders MaskedInput component', () => {
    render(<MaskedInput label="PAN Card" value="ABCDE1234F" name="pan" type="pan" />);
    
    expect(screen.getByText('PAN Card')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  test('renders ErrorMessage component with correct accessibility attributes', () => {
    render(<ErrorMessage message="This field is required" />);
    
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
    expect(alertElement).toHaveTextContent('This field is required');
    expect(alertElement).toHaveAttribute('aria-live', 'polite');
  });
});