import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { IntakeConfirmationComponent } from './intake-confirmation.component';

describe('IntakeConfirmationComponent', () => {
  let fixture: ComponentFixture<IntakeConfirmationComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntakeConfirmationComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'getCurrentNavigation').and.returnValue({
      extras: {
        state: {
          confirmationId: 'confirm-1',
          submittedAt: '2026-04-20T05:30:00.000Z',
          flaggedForManualReview: false,
        },
      },
    } as unknown as ReturnType<Router['getCurrentNavigation']>);

    fixture = TestBed.createComponent(IntakeConfirmationComponent);
    fixture.detectChanges();
  });

  it('uses secure receipt wording and does not echo SSN digits', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Your information, including your Social Security Number, has been securely received.');
    expect(text).not.toContain('123-45-6789');
    expect(text).not.toMatch(/\d{3}-\d{2}-\d{4}/);
  });
});
