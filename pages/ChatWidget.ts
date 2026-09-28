import type { Page, Locator } from '@playwright/test';

export const CHAT_ENDPOINT = '**/api/chat';

/** "Pod" — the AI assistant launcher present on every page. */
export class ChatWidget {
  readonly launcher: Locator;
  readonly dialog: Locator;
  readonly input: Locator;
  readonly sendButton: Locator;
  readonly closeButton: Locator;

  constructor(readonly page: Page) {
    this.launcher = page.getByRole('button', { name: 'Open Pod chat' });
    this.dialog = page.getByRole('dialog', { name: /Pod — Techdome assistant/ });
    this.input = this.dialog.getByRole('textbox', { name: 'Message Pod' });
    this.sendButton = this.dialog.getByRole('button', { name: 'Send message' });
    this.closeButton = this.dialog.getByRole('button', { name: 'Close' });
  }

  async open() {
    await this.launcher.click();
    await this.dialog.waitFor({ state: 'visible' });
  }

  async send(message: string) {
    await this.input.fill(message);
    await this.sendButton.click();
  }
}
