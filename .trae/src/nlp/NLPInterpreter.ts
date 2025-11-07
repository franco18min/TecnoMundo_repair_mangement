export type ParsedAction = {
  intent: 'create_component' | 'report_error' | 'need' | 'switch_context' | 'document' | 'test' | 'clarify';
  target?: 'backend' | 'frontend' | 'database';
  payload?: Record<string, any>;
  questions?: string[];
};

const patterns = {
  create_component: /crear\s+componente\s+para\s+(.*)/i,
  report_error: /(hay|tengo)\s+error\s+en\s+(.*)/i,
  need: /necesito\s+(.*)/i,
  switch_context: /cambiar\s+a\s+(backend|frontend|base\s*de\s*datos|database)/i,
  document: /documentar\s+(.*)/i,
  test: /(probar|testear|verificar)\s+(.*)/i
};

function normalizeTarget(raw?: string): 'backend'|'frontend'|'database'|undefined {
  if (!raw) return undefined;
  const r = raw.toLowerCase();
  if (r.includes('front')) return 'frontend';
  if (r.includes('back')) return 'backend';
  if (r.includes('base') || r.includes('data')) return 'database';
  return undefined;
}

export class NLPInterpreter {
  parse(command: string): ParsedAction {
    if (patterns.create_component.test(command)) {
      const [, detail] = command.match(patterns.create_component)!;
      return { intent: 'create_component', payload: { detail }, target: normalizeTarget(detail) };
    }
    if (patterns.report_error.test(command)) {
      const [, , area] = command.match(patterns.report_error)!;
      return { intent: 'report_error', payload: { area }, target: normalizeTarget(area) };
    }
    if (patterns.need.test(command)) {
      const [, need] = command.match(patterns.need)!;
      return { intent: 'need', payload: { need }, target: normalizeTarget(need) };
    }
    if (patterns.switch_context.test(command)) {
      const [, targetRaw] = command.match(patterns.switch_context)!;
      return { intent: 'switch_context', target: normalizeTarget(targetRaw) };
    }
    if (patterns.document.test(command)) {
      const [, topic] = command.match(patterns.document)!;
      return { intent: 'document', payload: { topic }, target: normalizeTarget(topic) };
    }
    if (patterns.test.test(command)) {
      const [, , what] = command.match(patterns.test)!;
      return { intent: 'test', payload: { what }, target: normalizeTarget(what) };
    }

    // Ambigüedad
    return {
      intent: 'clarify',
      questions: [
        '¿Puedes especificar si la acción es para backend, frontend o base de datos?',
        '¿Deseas ejecutar esto en entorno dev, test o prod?',
        '¿Hay restricciones o prioridades específicas para esta tarea?'
      ]
    };
  }
}