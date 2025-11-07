import * as fs from 'fs';
import * as path from 'path';

function main() {
  const file = path.resolve('.trae', 'cache', 'metrics.json');
  if (!fs.existsSync(file)) {
    console.log('No hay métricas registradas aún.');
    return;
  }
  const entries = JSON.parse(fs.readFileSync(file, 'utf-8')) as Array<{ estimatedTokens: number; ts: number }>;
  if (!entries.length) {
    console.log('No hay métricas registradas.');
    return;
  }
  const total = entries.length;
  const avgTokens = Math.round(entries.reduce((sum, e) => sum + (e.estimatedTokens || 0), 0) / total);
  const last = entries[entries.length - 1];

  console.log('--- Métricas de Tokens (Resumen) ---');
  console.log(`Total de entradas: ${total}`);
  console.log(`Promedio de tokens estimados: ${avgTokens}`);
  console.log(`Último registro (ts): ${last?.ts}`);
}

main();