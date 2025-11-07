import * as fs from 'fs';
import * as path from 'path';
import { resolveTraePath } from '../utils/paths';

export type ContextItem = {
  id: string;
  type: 'backend' | 'frontend' | 'database' | 'generic';
  description: string;
  timestamp: number;
  payload?: any;
};

export class ContextManager {
  private file: string;

  constructor(file = resolveTraePath('cache', 'context.json')) {
    this.file = file;
    const dir = path.dirname(this.file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(this.file)) fs.writeFileSync(this.file, '[]');
  }

  load(): ContextItem[] {
    try {
      const raw = fs.readFileSync(this.file, 'utf-8');
      const data = JSON.parse(raw) as ContextItem[];
      return this.sortByRecent(data);
    } catch {
      return [];
    }
  }

  save(items: ContextItem[]) {
    fs.writeFileSync(this.file, JSON.stringify(this.sortByRecent(items), null, 2));
  }

  add(item: ContextItem) {
    const items = this.load();
    items.push(item);
    this.save(items);
  }

  clear() {
    fs.writeFileSync(this.file, '[]');
  }

  sortByRecent(items: ContextItem[]): ContextItem[] {
    return [...items].sort((a, b) => b.timestamp - a.timestamp);
  }
}