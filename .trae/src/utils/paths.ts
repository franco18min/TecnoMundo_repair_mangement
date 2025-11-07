import * as path from 'path';

export function getTraeBaseDir(): string {
  const cwd = process.cwd();
  return path.basename(cwd) === '.trae' ? cwd : path.resolve('.trae');
}

export function resolveTraePath(...segments: string[]): string {
  const base = getTraeBaseDir();
  return path.resolve(base, ...segments);
}