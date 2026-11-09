import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    include: ['tests/unit/schemas.test.ts', 'tests/unit/components.test.ts'],
    maxWorkers: 1,
    testNamePattern: /product|ProductGrid|show/,
  },
});
