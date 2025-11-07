import * as fs from 'fs';
import * as path from 'path';
import { resolveTraePath } from '../utils/paths';

export class MetricsCollector {
  private file: string;
  constructor(file = resolveTraePath('cache', 'metrics.json')) {
    this.file = file;
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.file)) fs.writeFileSync(this.file, '[]');
  }

  record(entry: any) {
    let store: any[] = [];
    try { store = JSON.parse(fs.readFileSync(this.file, 'utf-8')); } catch {}
    store.push({ ...entry, ts: Date.now() });
    fs.writeFileSync(this.file, JSON.stringify(store, null, 2));
  }
}