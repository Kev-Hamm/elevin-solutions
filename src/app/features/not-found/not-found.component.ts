import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="not-found-shell" aria-labelledby="not-found-title">
      <section class="not-found-card">
        <a routerLink="/" class="not-found-brand" aria-label="Elevin Solutions public home">
          <span class="brand-mark" aria-hidden="true">E</span>
          <span>Elevin Solutions</span>
        </a>
        <p class="eyebrow">404 / Page not found</p>
        <h1 id="not-found-title">This page is not part of the current Elevin workspace.</h1>
        <p>
          The link may be outdated or the address may have been typed incorrectly. For security, protected staff areas still require a valid sign-in.
        </p>
        <div class="not-found-actions">
          <a routerLink="/" class="primary-link">Back to public home</a>
          <a routerLink="/login" class="ghost-action">Staff login</a>
        </div>
      </section>
    </main>
  `,
})
export class NotFoundComponent {}
