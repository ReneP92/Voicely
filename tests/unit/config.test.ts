import { describe, expect, it } from 'vitest';
import { apiEnvironment, readEnvironment } from '@voicely/core';

describe('startup configuration', () => {
  it('rejects missing/invalid settings without leaking values', () => {
    expect(() => readEnvironment(apiEnvironment, {})).toThrow('DATABASE_URL');
    expect(() =>
      readEnvironment(apiEnvironment, { DATABASE_URL: 'https://user:secret@host', PORT: '0' }),
    ).toThrow('DATABASE_URL, PORT');
    expect(() =>
      readEnvironment(apiEnvironment, { DATABASE_URL: 'https://user:secret@host' }),
    ).not.toThrow('secret');
  });
  it('binds locally by default and parses a valid numeric port', () => {
    const config = readEnvironment(apiEnvironment, {
      DATABASE_URL: 'postgres://localhost/test',
      PORT: '4200',
    });
    expect(config.HOST).toBe('127.0.0.1');
    expect(config.PORT).toBe(4200);
  });
});
