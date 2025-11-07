import { NLPInterpreter } from '../nlp/NLPInterpreter';
import { TraeAdapter } from '../engine/TraeAdapter';

async function main() {
  const nlp = new NLPInterpreter();
  const trae = new TraeAdapter('dev');

  const command = 'crear componente para frontend navbar responsive';
  const parsed = nlp.parse(command);
  const target = parsed.target;

  const { prompt, metrics } = trae.buildPromptForTrae({
    command,
    target,
    details: 'Componente accesible (WCAG 2.1 AA) con TailwindCSS y soporte mobile-first'
  });

  console.log('--- Prompt Optimizado ---');
  console.log(prompt);
  console.log('\n--- Métricas ---');
  console.log(metrics);

  console.log('\n--- Cierre ---');
  console.log(trae.closingPrompt());
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});