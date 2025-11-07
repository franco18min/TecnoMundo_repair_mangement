import { describe, it, expect } from 'vitest';
import { NLPInterpreter } from '../src/nlp/NLPInterpreter';

describe('NLPInterpreter (ES)', () => {
  const nlp = new NLPInterpreter();

  it('parses crear componente', () => {
    const res = nlp.parse('crear componente para frontend navbar');
    expect(res.intent).toBe('create_component');
    expect(res.target).toBe('frontend');
  });

  it('returns clarifications on ambiguity', () => {
    const res = nlp.parse('hacer algo');
    expect(res.intent).toBe('clarify');
    expect(res.questions?.length).toBeGreaterThan(0);
  });
});