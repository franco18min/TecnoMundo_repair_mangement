import * as fs from 'fs';
import * as path from 'path';
import { MappingRegistry, MappingKind } from '../mapping/MappingRegistry';
import { ContextManager } from '../context/ContextManager';
import { MaxModeTokenOptimizer } from '../token/TokenOptimizer';
import { resolveTraePath } from '../utils/paths';

export type ActionRequest = {
  command: string; // español
  target?: MappingKind; // backend | frontend | database
  details?: string;
};

export class PromptEngine {
  private mapping: MappingRegistry;
  private context: ContextManager;
  private optimizer: MaxModeTokenOptimizer;
  private rulesUser: any;
  private rulesProject: any;
  private systemPrompt: string;

  constructor(env: 'dev'|'test'|'prod' = 'dev') {
    this.mapping = new MappingRegistry();
    this.context = new ContextManager();
    this.optimizer = new MaxModeTokenOptimizer(env);
    this.rulesUser = JSON.parse(fs.readFileSync(resolveTraePath('rules','user.json'), 'utf-8'));
    this.rulesProject = JSON.parse(fs.readFileSync(resolveTraePath('rules','project.json'), 'utf-8'));
    this.systemPrompt = fs.readFileSync(resolveTraePath('prompts','system.md'), 'utf-8');
  }

  buildPrompt(req: ActionRequest): { prompt: string; metrics: any } {
    const ctx = this.context.load();
    const targets = req.target ? this.mapping.resolveTargets(req.target) : [];
    const header = [
      `# Sistema Trae 2.0`,
      `Reglas Usuario: ${JSON.stringify(this.rulesUser)}`,
      `Reglas Proyecto: ${JSON.stringify(this.rulesProject.project)}`,
      `Contexto (priorizado): ${JSON.stringify(ctx.slice(0,5))}`,
      `Targets: ${targets.join(', ')}`,
      `Comando: ${req.command}`,
      `Detalles: ${req.details ?? ''}`
    ].join('\n');

    const rawPrompt = `${this.systemPrompt}\n\n${header}`;
    const { optimized, metrics } = this.optimizer.optimize(rawPrompt);
    return { prompt: optimized, metrics };
  }

  closingQuestion(): string {
    return this.rulesUser?.closingBehavior?.prompt || '¿Es esta la última petición para esta tarea?';
  }

  clearContextIfConfirmed(confirm: boolean) {
    if (confirm && this.rulesUser?.closingBehavior?.clearContextOnLast) {
      this.context.clear();
    }
  }
}