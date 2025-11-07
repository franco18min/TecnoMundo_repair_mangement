/*
  CLI para construir prompts optimizados usando Trae 2.0.
  Uso:
    npm run prompt -- --env dev --target frontend --command "crear componente para frontend navbar" --details "Accesible"
  Flags:
    --env: dev | test | prod (opcional, por defecto dev)
    --target: backend | frontend | database (opcional; si falta, se intenta deducir con NLP)
    --command: texto del comando en español (obligatorio si no se usa STDIN)
    --details: texto adicional (opcional)
    --confirmLast: true|false (opcional; si true, limpia el contexto al final)
*/
import { NLPInterpreter } from '../nlp/NLPInterpreter';
import { TraeAdapter } from '../engine/TraeAdapter';

function parseArgs(argv: string[]) {
  const args: Record<string, string|boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '');
      const next = argv[i+1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data.trim()));
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = (args.env as 'dev'|'test'|'prod') || 'dev';
  let command = (args.command as string) || '';
  const target = (args.target as 'backend'|'frontend'|'database') || undefined;
  const details = (args.details as string) || '';
  const confirmLast = args.confirmLast === true || args.confirmLast === 'true';

  if (!command) {
    command = await readStdin();
  }
  if (!command) {
    console.error('Falta --command o entrada por STDIN.');
    process.exit(2);
  }

  const nlp = new NLPInterpreter();
  const trae = new TraeAdapter(env);
  const parsed = nlp.parse(command);
  const finalTarget = target || parsed.target;

  const { prompt, metrics } = trae.buildPromptForTrae({ command, target: finalTarget, details });
  console.log('--- Prompt Optimizado ---');
  console.log(prompt);
  console.log('\n--- Métricas ---');
  console.log(JSON.stringify(metrics, null, 2));
  console.log('\n--- Cierre ---');
  console.log(trae.closingPrompt());

  if (confirmLast) {
    trae.endConversation(true);
    console.log('\nContexto limpiado.');
  }
}

main().catch(err => { console.error(err); process.exit(1); });