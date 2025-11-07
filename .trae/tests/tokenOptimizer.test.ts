import { describe, it, expect } from 'vitest';
import { MaxModeTokenOptimizer } from '../src/token/TokenOptimizer';

describe('MaxModeTokenOptimizer', () => {
  it('minifies JSON and computes metrics', () => {
    const opt = new MaxModeTokenOptimizer('test');
    const json = JSON.stringify({ a: 1, b: 2 }, null, 2);
    const { optimized, metrics } = opt.optimize(json);
    expect(optimized).toBe('{"a":1,"b":2}');
    expect(metrics.estimatedTokens).toBeGreaterThan(0);
  });

  it('prioritizes code-like lines', () => {
    const opt = new MaxModeTokenOptimizer('test');
    const input = `import x from 'y'\n\n some text \n backend/app/api/route.py`;
    const { optimized } = opt.optimize(input);
    expect(optimized.split('\n')[0]).toContain('import');
  });
});