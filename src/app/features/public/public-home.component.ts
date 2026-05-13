import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { merge } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="public-shell" [class.menu-open]="mobileMenuOpen">
      <header class="topbar">
        <a routerLink="/" class="brand" aria-label="Elevin Solutions home" (click)="closeMobileMenu(false)">
          <span>Elevin Solutions</span>
        </a>

        <nav class="desktop-nav" aria-label="Public navigation">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a routerLink="/intake" class="nav-primary">Start Intake</a>
          <a routerLink="/login" class="login-link">Staff login</a>
        </nav>

        <div class="mobile-header-actions" aria-label="Mobile public navigation actions">
          <a routerLink="/intake" class="mobile-start-cta">Start Intake</a>
          <button
            #menuButton
            type="button"
            class="hamburger-button"
            [attr.aria-label]="mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'"
            [attr.aria-expanded]="mobileMenuOpen"
            aria-controls="mobile-navigation-drawer"
            (click)="toggleMobileMenu()"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </button>
        </div>
      </header>

      <div
        class="mobile-menu-overlay"
        [class.open]="mobileMenuOpen"
        [attr.aria-hidden]="!mobileMenuOpen"
        (click)="closeMobileMenu()"
      ></div>

      <aside
        #drawer
        id="mobile-navigation-drawer"
        class="mobile-drawer"
        [class.open]="mobileMenuOpen"
        [attr.aria-hidden]="!mobileMenuOpen"
        aria-label="Mobile navigation menu"
        (keydown)="onDrawerKeydown($event)"
      >
        <div class="drawer-header">
          <span class="drawer-brand">Elevin Solutions</span>
          <button type="button" class="drawer-close" aria-label="Close navigation menu" (click)="closeMobileMenu()">×</button>
        </div>
        <nav class="drawer-nav" aria-label="Mobile public navigation links">
          <a routerLink="/intake" class="drawer-primary" (click)="closeMobileMenu(false)">Start Intake</a>
          <a href="#about" (click)="closeMobileMenu(false)">About</a>
          <a href="#services" (click)="closeMobileMenu(false)">Services</a>
          <a routerLink="/login" (click)="closeMobileMenu(false)">Staff login</a>
          <a *ngIf="isLoggedIn" routerLink="/dashboard" (click)="closeMobileMenu(false)">Open dashboard</a>
        </nav>
      </aside>

      <main>
        <section class="hero" aria-labelledby="hero-title">
          <div class="hero-copy">
            <p class="eyebrow">Warm housing support, designed with dignity</p>
            <h1 id="hero-title">A welcoming first step toward safe, stable housing.</h1>
            <p class="lede">
              Elevin Solutions gives applicants, families, and referral partners a calm public front door
              to begin intake, understand services, and connect with staff without confusion.
            </p>
            <div class="actions" aria-label="Primary public actions">
              <a routerLink="/intake" class="btn btn-primary hero-primary-cta">Start Intake</a>
              <a href="#services" class="btn btn-secondary">Explore services</a>
              <a *ngIf="isLoggedIn" routerLink="/dashboard" class="btn btn-tertiary">Open dashboard</a>
            </div>
            <p class="staff-note">
              Staff member? <a routerLink="/login">Sign in to review referrals and manage housing operations.</a>
            </p>
          </div>

          <figure class="hero-image-card">
            <img
              src="assets/elderly_co-living.png"
              alt="Residents gathered in a bright, comfortable co-living living room"
            />
            <figcaption>
              <span>Warm residential support</span>
              A shared-home environment designed for dignity and stability.
            </figcaption>
          </figure>
        </section>

        <section id="about" class="about-section section-surface" aria-labelledby="about-title">
          <div class="card about-card">
            <p class="section-kicker">About</p>
            <h2 id="about-title">Housing support that feels stable, respectful, and trustworthy.</h2>
            <p>
              Elevin Solutions supports people who need a clearer path into housing services, from first contact
              through staff review and ongoing coordination.
            </p>
            <p>
              The public experience is designed to reduce uncertainty: applicants can start intake securely,
              families can understand what happens next, and staff can receive cleaner information for faster follow-up.
            </p>
          </div>
          <div class="trust-card" aria-label="Elevin public support highlights">
            <div>
              <strong>Plain-language intake</strong>
              <span>Clear steps for applicants, families, and referral partners.</span>
            </div>
            <div>
              <strong>Respectful follow-up</strong>
              <span>Staff can review submissions and prioritize outreach without confusion.</span>
            </div>
          </div>
        </section>

        <section id="services" class="services-section section-surface alt" aria-labelledby="services-title">
          <div class="section-heading">
            <p class="section-kicker">Services</p>
            <h2 id="services-title">How we help people move forward</h2>
            <p>
              Public-facing clarity stays connected to the staff tools that keep intake, follow-up, and housing operations moving.
            </p>
          </div>
          <div class="service-list">
            <article>
              <span class="card-number">01</span>
              <h3>Start intake with confidence</h3>
              <p>Applicants can share key information securely so the staff team can review next steps without repeated back-and-forth.</p>
            </article>
            <article>
              <span class="card-number">02</span>
              <h3>Clear staff follow-up</h3>
              <p>Caseworkers can sign in to review submissions, prioritize outreach, and keep the intake queue moving with less friction.</p>
            </article>
            <article>
              <span class="card-number">03</span>
              <h3>Connected housing operations</h3>
              <p>Once someone is in the system, staff can coordinate clients, units, occupancies, settings, and user access from one place.</p>
            </article>
          </div>
        </section>

        <section class="intake-band" aria-labelledby="intake-title">
          <div>
            <p class="section-kicker">Begin here</p>
            <h2 id="intake-title">Ready to take the next step?</h2>
            <p>
              Complete the public intake form when you are ready. Elevin staff will use your submission to understand your needs and follow up with care.
            </p>
          </div>
          <a routerLink="/intake" class="btn btn-primary btn-large">Start Intake</a>
        </section>
      </main>

      <div class="sticky-intake-cta" aria-label="Mobile quick intake action">
        <a routerLink="/intake" class="btn btn-primary">Start Intake</a>
      </div>
    </div>
  `,
  styles: []
})
export class PublicHomeComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly authService = inject(AuthService);

  @ViewChild('menuButton') private readonly menuButton?: ElementRef<HTMLButtonElement>;
  @ViewChild('drawer') private readonly drawer?: ElementRef<HTMLElement>;

  readonly isLoggedIn = this.authService.isLoggedIn();
  mobileMenuOpen = false;

  ngOnInit(): void {
    merge(this.route.fragment, this.route.data).subscribe(() => {
      const fragment = this.route.snapshot.fragment;
      const scrollTarget = fragment || this.route.snapshot.data['scrollTarget'];

      if (scrollTarget) {
        setTimeout(() => this.viewportScroller.scrollToAnchor(scrollTarget), 0);
      } else {
        this.viewportScroller.scrollToPosition([0, 0]);
      }
    });
  }

  ngOnDestroy(): void {
    this.unlockBodyScroll();
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    }
  }

  toggleMobileMenu(): void {
    if (this.mobileMenuOpen) {
      this.closeMobileMenu();
    } else {
      this.openMobileMenu();
    }
  }

  openMobileMenu(): void {
    this.mobileMenuOpen = true;
    this.lockBodyScroll();
    setTimeout(() => this.getFocusableDrawerElements()[0]?.focus(), 0);
  }

  closeMobileMenu(returnFocus = true): void {
    if (!this.mobileMenuOpen) {
      return;
    }

    this.mobileMenuOpen = false;
    this.unlockBodyScroll();

    if (returnFocus) {
      setTimeout(() => this.menuButton?.nativeElement.focus(), 0);
    }
  }

  onDrawerKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab' || !this.mobileMenuOpen) {
      return;
    }

    const focusable = this.getFocusableDrawerElements();
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusableDrawerElements(): HTMLElement[] {
    const drawerElement = this.drawer?.nativeElement;
    if (!drawerElement) {
      return [];
    }

    return Array.from(
      drawerElement.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
    ).filter(element => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');
  }

  private lockBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScroll(): void {
    document.body.style.overflow = '';
  }
}
