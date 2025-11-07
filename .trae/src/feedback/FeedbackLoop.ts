import * as fs from 'fs';
import * as path from 'path';
import { resolveTraePath } from '../utils/paths';

export type FeedbackEntry = {
  source: 'user' | 'system' | 'test';
  message: string;
  severity?: 'low' | 'medium' | 'high';
  ts?: number;
};

export class FeedbackLoop {
  private file: string;
  constructor(file = resolveTraePath('cache', 'feedback.json')) {
    this.file = file;
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.file)) fs.writeFileSync(this.file, '[]');
  }

  submit(entry: FeedbackEntry) {
    let store: FeedbackEntry[] = [];
    try { store = JSON.parse(fs.readFileSync(this.file, 'utf-8')); } catch {}
    store.push({ ...entry, ts: Date.now() });
    fs.writeFileSync(this.file, JSON.stringify(store, null, 2));
  }
}