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
          <img class="brand-logo" src="assets/elevin-logo.webp" alt="" aria-hidden="true" />
          <span>Elevin Solutions</span>
        </a>

        <nav class="desktop-nav" aria-label="Public navigation">
          <a routerLink="/about">About Us</a>
          <a href="#services">Services</a>
          <a routerLink="/intake" class="nav-primary">Start Intake</a>
          <a *ngIf="!isLoggedIn" routerLink="/login" class="login-link">Staff login</a>
          <a *ngIf="isLoggedIn" routerLink="/dashboard" class="login-link">Open dashboard</a>
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
          <span class="drawer-brand">
            <img class="drawer-logo" src="assets/elevin-logo.webp" alt="" aria-hidden="true" />
            Elevin Solutions
          </span>
          <button type="button" class="drawer-close" aria-label="Close navigation menu" (click)="closeMobileMenu()">×</button>
        </div>
        <nav class="drawer-nav" aria-label="Mobile public navigation links">
          <a routerLink="/intake" class="drawer-primary" (click)="closeMobileMenu(false)">Start Intake</a>
          <a routerLink="/about" (click)="closeMobileMenu(false)">About Us</a>
          <a href="#services" (click)="closeMobileMenu(false)">Services</a>
          <a *ngIf="!isLoggedIn" routerLink="/login" (click)="closeMobileMenu(false)">Staff login</a>
          <a *ngIf="isLoggedIn" routerLink="/dashboard" (click)="closeMobileMenu(false)">Open dashboard</a>
        </nav>
      </aside>

      <main>
        <section class="hero" aria-labelledby="hero-title">
          <div class="hero-copy">
            <p class="eyebrow">Warm housing support, designed with dignity</p>
            <h1 id="hero-title">Safe and supportive housing for those who need it most.</h1>
            <p class="lede">
              Elevin Solutions offers furnished private and shared rooms in respectful co-living homes,
              with shared beds starting at the $750 all-inclusive baseline rate.
            </p>
            <div class="actions" aria-label="Primary public actions">
              <a routerLink="/intake" class="btn btn-primary hero-primary-cta">Start Intake</a>
              <a href="#services" class="btn btn-secondary">Explore housing</a>
              <a *ngIf="isLoggedIn" routerLink="/dashboard" class="btn btn-tertiary">Open dashboard</a>
            </div>
            <p class="staff-note">Participants, families, and referral partners can begin with a simple intake request.</p>
          </div>

          <figure class="hero-image-card">
            <img
              src="assets/elderly_co-living.png"
              alt="Residents gathered in a bright, comfortable co-living living room"
            />
            <figcaption>
              <span>Warm residential support</span>
              Furnished rooms, stable routines, and practical support.
            </figcaption>
          </figure>
        </section>

        <section id="about" class="about-section section-surface" aria-labelledby="about-title">
          <div class="card about-card">
            <p class="section-kicker">About</p>
            <h2 id="about-title">Building communities filled with compassion and care.</h2>
            <p>
              Founded in 2016, Elevin Solutions builds clean, safe shared living communities for hardworking
              individuals and vulnerable populations who need affordability, dignity, and a stable place to belong.
            </p>
            <p>
              Homes include private and shared rooms, welcoming kitchens and common areas, onsite laundry, beds,
              utilities, wifi, and furnishings in the shared spaces.
            </p>
            <a routerLink="/about" class="text-link">Read the full About Us story</a>
          </div>
          <div class="trust-card" aria-label="Elevin public support highlights">
            <div>
              <strong>Plain-language intake</strong>
              <span>Clear steps for applicants, families, and referral partners.</span>
            </div>
            <div>
              <strong>Rooms from $750 per month</strong>
              <span>Private and semi-private options are available based on fit and capacity.</span>
            </div>
          </div>
        </section>

        <section class="home-gallery-section section-surface" aria-labelledby="gallery-title">
          <div class="section-heading">
            <p class="section-kicker">Inside the homes</p>
            <h2 id="gallery-title">A closer look at the living spaces</h2>
            <p>
              Photos rotate automatically and can be opened manually. Portrait and landscape images keep their
              natural room framing instead of stretching.
            </p>
          </div>

          <div class="home-carousel-shell">
            <figure
              class="home-carousel-frame"
              [class.portrait-frame]="carouselPhotos[activePhotoIndex].orientation === 'portrait'"
              [class.landscape-frame]="carouselPhotos[activePhotoIndex].orientation === 'landscape'"
            >
              <img
                [src]="carouselPhotos[activePhotoIndex].src"
                [alt]="carouselPhotos[activePhotoIndex].alt"
              />
              <figcaption>
                <span>{{ carouselPhotos[activePhotoIndex].title }}</span>
                {{ carouselPhotos[activePhotoIndex].caption }}
              </figcaption>
            </figure>

            <div class="carousel-controls gallery-controls" aria-label="Carousel controls">
              <button type="button" (click)="previousPhoto()" aria-label="Previous photo">‹</button>
              <div class="carousel-dots" aria-label="Select photo">
                <button
                  *ngFor="let photo of carouselPhotos; let i = index"
                  type="button"
                  [class.active]="i === activePhotoIndex"
                  [attr.aria-label]="'Show photo ' + (i + 1) + ': ' + photo.title"
                  [attr.aria-current]="i === activePhotoIndex ? 'true' : null"
                  (click)="setPhoto(i)"
                ></button>
              </div>
              <button type="button" (click)="nextPhoto()" aria-label="Next photo">›</button>
            </div>
          </div>
        </section>

        <section id="services" class="services-section section-surface alt" aria-labelledby="services-title">
          <div class="section-heading">
            <p class="section-kicker">Services</p>
            <h2 id="services-title">What we offer</h2>
            <p>
              Support is centered on stable housing, furnished rooms, and a simple path to request placement.
            </p>
          </div>
          <div class="service-list">
            <article>
              <span class="card-number">01</span>
              <h3>Fully Furnished Homes</h3>
              <p>Comfortable private and semi-private rooms in a clean, move-in-ready shared-home environment.</p>
            </article>
            <article>
              <span class="card-number">02</span>
              <h3>Drug- &amp; Alcohol-Free Environment</h3>
              <p>A sober, supportive setting with stable routines and respectful shared-home expectations.</p>
            </article>
            <article>
              <span class="card-number">03</span>
              <h3>All-Inclusive Shared Bed Baseline</h3>
              <p>Shared beds start at $750 per month. Private rooms cost more based on room and bathroom setup.</p>
            </article>
            <article>
              <span class="card-number">04</span>
              <h3>Convenient Location</h3>
              <p>Placement options are reviewed by staff based on fit, availability, timing, and resident needs.</p>
            </article>
          </div>
        </section>

        <section id="contact" class="services-section section-surface" aria-labelledby="contact-title">
          <div class="section-heading">
            <p class="section-kicker">Contact us</p>
            <h2 id="contact-title">How to get started</h2>
            <p>
              Start with the intake form so Elevin staff can review the request and follow up with the right next step.
            </p>
          </div>
          <div class="service-list contact-list">
            <article>
              <span class="card-number">01</span>
              <h3>Submit intake</h3>
              <p>Share basic contact, referral, and housing-need details through the secure public form.</p>
            </article>
            <article>
              <span class="card-number">02</span>
              <h3>Staff review</h3>
              <p>Elevin staff review submissions, confirm availability, and prioritize follow-up.</p>
            </article>
            <article>
              <span class="card-number">03</span>
              <h3>Contact directly</h3>
              <p>If you have questions before submitting intake, email <a href="mailto:admin@elevinsolutions.us">admin&#64;elevinsolutions.us</a>.</p>
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

        <footer id="privacy" class="public-footer" aria-label="Elevin Solutions footer">
          <div>
            <strong>Elevin Solutions</strong>
            <p>Safe and supportive furnished housing for those who need it most.</p>
          </div>
          <nav aria-label="Footer navigation">
            <a routerLink="/about">About Us</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact Us</a>
            <a routerLink="/intake">Start Intake</a>
            <a routerLink="/privacy-policy">Privacy Policy</a>
          </nav>
        </footer>
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
  readonly carouselPhotos = [
    { src: 'assets/elevin-home/elevin-home-01.jpg', title: 'Shared-home living space', caption: 'Common spaces are furnished for daily routines, meals, and connection.', alt: 'Shared living space inside an Elevin co-living home', orientation: 'landscape' },
    { src: 'assets/elevin-home/elevin-home-02.jpg', title: 'Move-in-ready room', caption: 'Bedrooms include beds and practical furnishings for resident stability.', alt: 'Furnished resident bedroom in an Elevin shared home', orientation: 'portrait' },
    { src: 'assets/elevin-home/elevin-home-03.jpg', title: 'Kitchen and shared areas', caption: 'Welcoming kitchens and common rooms help residents cook, connect, and settle in.', alt: 'Kitchen and common area in a shared housing home', orientation: 'portrait' },
    { src: 'assets/elevin-home/elevin-home-04.jpg', title: 'Clean bathroom access', caption: 'Bathroom setups vary by unit, with attached-bath private rooms priced separately.', alt: 'Clean bathroom inside an Elevin housing unit', orientation: 'landscape' },
    { src: 'assets/elevin-home/elevin-home-05.jpg', title: 'Daily living support', caption: 'Shared spaces are arranged for respectful routines and practical daily use.', alt: 'Furnished shared daily living area', orientation: 'portrait' },
    { src: 'assets/elevin-home/elevin-home-06.jpg', title: 'Laundry and utilities', caption: 'Onsite laundry, power, water, wifi, beds, TV, and common-area furniture are included.', alt: 'Laundry and utility area in a shared home', orientation: 'landscape' },
    { src: 'assets/elevin-home/elevin-home-07.jpg', title: 'Private room candidates', caption: 'Private rooms cost more depending on attached or private bathroom access.', alt: 'Private room candidate in a furnished shared home', orientation: 'portrait' },
    { src: 'assets/elevin-home/elevin-home-08.jpg', title: 'Shared-room baseline', caption: 'Standard rooms use two-person shared occupancy as the default planning baseline.', alt: 'Shared bedroom setup with resident beds', orientation: 'landscape' },
    { src: 'assets/elevin-home/elevin-home-09.jpg', title: 'Respectful housing', caption: 'Clean, safe, well-managed homes support financial stability and belonging.', alt: 'Furnished bedroom in a clean shared housing home', orientation: 'portrait' },
  ];
  mobileMenuOpen = false;
  activePhotoIndex = 0;
  private carouselTimerId: number | undefined;

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

    this.startCarouselTimer();
  }

  ngOnDestroy(): void {
    this.unlockBodyScroll();
    this.stopCarouselTimer();
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

  setPhoto(index: number): void {
    this.activePhotoIndex = index;
    this.restartCarouselTimer();
  }

  nextPhoto(): void {
    this.activePhotoIndex = (this.activePhotoIndex + 1) % this.carouselPhotos.length;
    this.restartCarouselTimer();
  }

  previousPhoto(): void {
    this.activePhotoIndex =
      (this.activePhotoIndex + this.carouselPhotos.length - 1) % this.carouselPhotos.length;
    this.restartCarouselTimer();
  }

  private startCarouselTimer(): void {
    this.stopCarouselTimer();
    this.carouselTimerId = window.setInterval(() => {
      this.activePhotoIndex = (this.activePhotoIndex + 1) % this.carouselPhotos.length;
    }, 4500);
  }

  private stopCarouselTimer(): void {
    if (this.carouselTimerId !== undefined) {
      window.clearInterval(this.carouselTimerId);
      this.carouselTimerId = undefined;
    }
  }

  private restartCarouselTimer(): void {
    this.startCarouselTimer();
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
