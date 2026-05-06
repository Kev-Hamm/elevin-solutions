import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-intake-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="confirmation-page">
      <div class="confirmation-card">
        <p class="eyebrow">Confirmation</p>
        <h1>Thank you. Your intake form has been submitted.</h1>
        <p class="message">
          Your intake information has been securely received.
        </p>
        <p class="detail" *ngIf="submittedAt; else fallbackReceiptState">
          Submitted at {{ submittedAt | date:'medium' }}.
        </p>
        <ng-template #fallbackReceiptState>
          <p class="detail">
            Keep your confirmation ID for reference. If you refresh this page later, we may no longer have the in-browser receipt timestamp.
          </p>
        </ng-template>
        <p class="detail" *ngIf="confirmationId">
          Confirmation ID: {{ confirmationId }}
        </p>
        <p class="detail" *ngIf="flaggedForManualReview">
          A team member may follow up for a little more review before the next step.
        </p>
        <div class="actions">
          <a routerLink="/intake" class="btn secondary">Return to intake</a>
          <a routerLink="/login" class="btn">Staff sign in</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: linear-gradient(180deg, #f8f6f1, #eef3f2); }
    .confirmation-page { padding: 2rem 1rem; display: flex; justify-content: center; }
    .confirmation-card {
      width: min(100%, 680px);
      background: rgba(255, 255, 255, 0.96);
      border-radius: 28px;
      box-shadow: 0 22px 52px rgba(15, 40, 84, 0.14);
      padding: 2rem;
    }
    .eyebrow { margin: 0 0 .5rem; text-transform: uppercase; letter-spacing: .12em; font-size: .75rem; color: #9a6b34; font-weight: 700; }
    h1 { margin: 0 0 .75rem; color: #0f2854; font-family: Georgia, 'Times New Roman', serif; }
    .message, .detail { color: #55606b; line-height: 1.6; }
    .actions { margin-top: 1.5rem; display: flex; gap: .75rem; flex-wrap: wrap; }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: .9rem 1.2rem;
      text-decoration: none;
      background: linear-gradient(135deg, #4f7e81, #2f6f73);
      color: #fff;
      font-weight: 700;
    }
    .secondary { background: #0f2854; }
  `],
})
export class IntakeConfirmationComponent {
  private readonly router = inject(Router);

  readonly navigationState = this.router.getCurrentNavigation()?.extras.state ?? history.state ?? {};
  readonly confirmationId = this.readStringState('confirmationId');
  readonly submittedAt = this.readStringState('submittedAt');
  readonly flaggedForManualReview = !!this.navigationState['flaggedForManualReview'];

  private readStringState(key: string): string | undefined {
    const value = this.navigationState[key];
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
  }
}
