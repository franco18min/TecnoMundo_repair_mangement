import { describe, it, expect } from 'vitest';
import { ContextManager } from '../src/context/ContextManager';

describe('ContextManager', () => {
  it('persists and loads context prioritized by recent', () => {
    const cm = new ContextManager();
    cm.clear();
    cm.add({ id: '1', type: 'generic', description: 'first', timestamp: Date.now() - 1000 });
    cm.add({ id: '2', type: 'generic', description: 'second', timestamp: Date.now() });
    const loaded = cm.load();
    expect(loaded[0].id).toBe('2');
  });
});