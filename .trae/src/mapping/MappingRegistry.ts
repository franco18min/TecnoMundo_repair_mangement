import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';
import { resolveTraePath } from '../utils/paths';

export type MappingKind = 'backend' | 'frontend' | 'database';

export interface MappingDef {
  kind: MappingKind;
  framework?: string;
  paths: string[];
  file_patterns: string[];
  semantics?: Record<string, any>;
  priority?: string[];
}

export class MappingRegistry {
  private baseDir: string;
  private registry: Record<MappingKind, MappingDef> = {
    backend: { kind: 'backend', paths: [], file_patterns: [] },
    frontend: { kind: 'frontend', paths: [], file_patterns: [] },
    database: { kind: 'database', paths: [], file_patterns: [] }
  };

  constructor(baseDir = resolveTraePath('mapping')) {
    this.baseDir = baseDir;
    this.loadAll();
  }

  private loadAll() {
    for (const kind of ['backend','frontend','database'] as MappingKind[]) {
      const file = path.resolve(this.baseDir, `${kind}.yaml`);
      if (!fs.existsSync(file)) continue;
      const raw = fs.readFileSync(file, 'utf-8');
      const data = YAML.parse(raw);
      const def: MappingDef = {
        kind,
        framework: data.framework,
        paths: data.paths ?? [],
        file_patterns: data.file_patterns ?? [],
        semantics: data.semantics ?? {},
        priority: data.priority ?? []
      };
      this.registry[kind] = def;
    }
  }

  get(kind: MappingKind): MappingDef {
    return this.registry[kind];
  }

  resolveTargets(kind: MappingKind): string[] {
    const def = this.get(kind);
    return def.paths.map(p => path.resolve(p));
  }
}