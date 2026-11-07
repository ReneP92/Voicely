import { describe, expect, it } from 'vitest';
import { createDemoFixtures } from '@voicely/core';

describe('reusable demo fixtures', () => {
  it('keeps order relationships valid and synthetic contacts non-deliverable', () => {
    const fixture = createDemoFixtures(new Date('2026-11-04T12:00:00Z'));
    const skus = fixture.products.flatMap((product) =>
      product.variants.map((variant) => variant.sku),
    );
    expect(new Set(skus).size).toBe(skus.length);
    for (const order of fixture.orders) {
      expect(skus).toContain(order.sku);
      expect(fixture.customers.some((customer) => customer.id === order.customerId)).toBe(true);
    }
    expect(fixture.customers.every((customer) => customer.email.endsWith('@example.invalid'))).toBe(
      true,
    );
  });
  it('keeps in-window/out-of-window examples stable as the clock advances', () => {
    for (const now of [new Date('2026-11-04T12:00:00Z'), new Date('2028-03-01T00:00:00Z')]) {
      const fixture = createDemoFixtures(now);
      const eligible = fixture.orders.find((order) => order.id === 'TS-1001')!;
      const expired = fixture.orders.find((order) => order.id === 'TS-1002')!;
      expect(now.getTime() - Date.parse(eligible.deliveredAt!)).toBe(7 * 86400000);
      expect(now.getTime() - Date.parse(expired.deliveredAt!)).toBeGreaterThan(30 * 86400000);
      expect(createDemoFixtures(now)).toEqual(fixture);
    }
    expect(() => createDemoFixtures(new Date('invalid'))).toThrow('Invalid fixture clock');
  });
});
