import { PromptEngine, ActionRequest } from './PromptEngine';

export class TraeAdapter {
  private engine: PromptEngine;
  constructor(env: 'dev'|'test'|'prod' = 'dev') {
    this.engine = new PromptEngine(env);
  }

  buildPromptForTrae(req: ActionRequest) {
    return this.engine.buildPrompt(req);
  }

  closingPrompt() {
    return this.engine.closingQuestion();
  }

  endConversation(confirmLast: boolean) {
    this.engine.clearContextIfConfirmed(confirmLast);
  }
}