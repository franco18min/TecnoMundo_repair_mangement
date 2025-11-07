import { EventEmitter } from 'eventemitter3';
import * as fs from 'fs';
import * as path from 'path';
import { resolveTraePath } from '../utils/paths';

type MaxModeConfig = {
  threshold: number;
  warningAt: number;
  hardLimit: number;
  compression: {
    minifyJson: boolean;
    minifyCode: boolean;
    removeComments: boolean;
    stripWhitespace: boolean;
  };
  prioritization: {
    segments: string[];
    dropLowValue: boolean;
  };
};

export type TokenMetrics = {
  estimatedTokens: number;
  length: number;
  threshold: number;
  warningAt: number;
  hardLimit: number;
  ts: number;
};

export class MaxModeTokenOptimizer extends EventEmitter {
  private config: MaxModeConfig;
  private cacheMetricsFile: string;

  constructor(env: 'dev'|'test'|'prod' = 'dev') {
    super();
    const configPath = resolveTraePath('config', `${env}.json`);
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    this.config = raw.tokens.maxMode as MaxModeConfig;
    this.cacheMetricsFile = resolveTraePath('cache', 'metrics.json');
    if (!fs.existsSync(path.dirname(this.cacheMetricsFile))) {
      fs.mkdirSync(path.dirname(this.cacheMetricsFile), { recursive: true });
    }
  }

  optimize(input: string): { optimized: string; metrics: TokenMetrics } {
    let text = input;
    // Compression
    if (this.config.compression.removeComments) {
      text = this.stripComments(text);
    }
    if (this.config.compression.stripWhitespace) {
      text = this.stripWhitespace(text);
    }
    if (this.config.compression.minifyJson) {
      text = this.minifyJson(text);
    }
    if (this.config.compression.minifyCode) {
      text = this.minifyCode(text);
    }
    // Prioritization
    text = this.prioritizeSegments(text);

    const metrics = this.computeMetrics(text);
    this.persistMetrics(metrics);
    this.emitAlerts(metrics);
    return { optimized: text, metrics };
  }

  private estimateTokens(len: number): number {
    // Heurística: ~4 caracteres por token
    return Math.ceil(len / 4);
  }

  private computeMetrics(text: string): TokenMetrics {
    const length = text.length;
    const estimatedTokens = this.estimateTokens(length);
    const { threshold, warningAt, hardLimit } = this.config;
    return { estimatedTokens, length, threshold, warningAt, hardLimit, ts: Date.now() };
  }

  private emitAlerts(metrics: TokenMetrics) {
    if (metrics.estimatedTokens > this.config.hardLimit) {
      this.emit('hardLimit', metrics);
    } else if (metrics.estimatedTokens > this.config.threshold) {
      this.emit('threshold', metrics);
    } else if (metrics.estimatedTokens > this.config.warningAt) {
      this.emit('warning', metrics);
    }
  }

  private persistMetrics(metrics: TokenMetrics) {
    let store: any[] = [];
    if (fs.existsSync(this.cacheMetricsFile)) {
      try { store = JSON.parse(fs.readFileSync(this.cacheMetricsFile, 'utf-8')); } catch {}
    }
    store.push(metrics);
    fs.writeFileSync(this.cacheMetricsFile, JSON.stringify(store, null, 2));
  }

  private stripComments(text: string): string {
    // Remove JS/TS/JSON comments and Python-style comments in simple heuristic
    return text
      .replace(/\/\/[\s\S]*?$/gm, '') // // line comments
      .replace(/\/*[\s\S]*?\*/gm, '') // /* block comments */
      .replace(/(^|\n)\s*#.*$/gm, '$1'); // # python comments
  }

  private stripWhitespace(text: string): string {
    return text.replace(/[\t ]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  }

  private minifyJson(text: string): string {
    try {
      const obj = JSON.parse(text);
      return JSON.stringify(obj);
    } catch {
      return text; // not pure JSON
    }
  }

  private minifyCode(text: string): string {
    // Simple heuristic: collapse multiple spaces/newlines
    return text.replace(/[ ]{2,}/g, ' ').replace(/\n{2,}/g, '\n');
  }

  private prioritizeSegments(text: string): string {
    const lines = text.split(/\r?\n/);
    const important: string[] = [];
    const others: string[] = [];
    const patterns = [
      /\.(tsx|ts|jsx|js|py|sql)\b/,
      /\b(frontend\/src|backend\/app|backend\/scripts)\b/,
      /\b(import|export|def|class|function|const|let|var|from)\b/,
      /CREATE\s+TABLE|ALTER\s+TABLE|SELECT|INSERT|UPDATE|DELETE/i
    ];
    for (const l of lines) {
      if (patterns.some(p => p.test(l))) important.push(l); else others.push(l);
    }
    const prioritized = important.join('\n') + (others.length ? '\n' + others.join('\n') : '');
    if (this.config.prioritization.dropLowValue) {
      // Drop extremely low-value lines (e.g., empty or trivial)
      return prioritized.split(/\r?\n/).filter(l => l.trim().length > 0).join('\n');
    }
    return prioritized;
  }
}