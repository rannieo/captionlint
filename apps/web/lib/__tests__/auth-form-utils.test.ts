import { describe, expect, it } from 'vitest';
import {
  getAuthErrorMessage,
  validateCreateAccountInput,
  validateSignInInput,
} from '../auth-form-utils';

describe('auth form utilities', () => {
  it('validates create account inputs', () => {
    expect(validateCreateAccountInput({ fullName: '', email: 'person@example.com', password: 'password123' })).toBe(
      'Enter your full name.',
    );
    expect(validateCreateAccountInput({ fullName: 'Jane Doe', email: 'invalid', password: 'password123' })).toBe(
      'Enter a valid email address.',
    );
    expect(validateCreateAccountInput({ fullName: 'Jane Doe', email: 'jane@example.com', password: 'short' })).toBe(
      'Password must be at least 8 characters.',
    );
    expect(validateCreateAccountInput({ fullName: 'Jane Doe', email: 'jane@example.com', password: 'password123' })).toBe(
      null,
    );
  });

  it('validates sign in inputs', () => {
    expect(validateSignInInput({ email: 'invalid', password: 'password123' })).toBe('Enter a valid email address.');
    expect(validateSignInInput({ email: 'jane@example.com', password: 'short' })).toBe(
      'Password must be at least 8 characters.',
    );
    expect(validateSignInInput({ email: 'jane@example.com', password: 'password123' })).toBe(null);
  });

  it('normalizes duplicate registration errors into user-facing copy', () => {
    expect(getAuthErrorMessage('User already exists')).toBe(
      'An account with this email already exists. Sign in instead.',
    );
  });

  it('normalizes invalid credential and network errors', () => {
    expect(getAuthErrorMessage({ message: 'Invalid email or password' })).toBe('Email or password is incorrect.');
    expect(getAuthErrorMessage(new TypeError('Failed to fetch'))).toBe(
      'Could not reach the authentication service. Check the API URL and try again.',
    );
  });
});
