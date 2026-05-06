import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { merge } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="public-shell">
      <header class="topbar">
        <a routerLink="/" class="brand" aria-label="Elevin Solutions home">
<span>Elevin Solutions</span>
        </a>
        <nav class="nav" aria-label="Public navigation">
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a routerLink="/intake" class="nav-primary">Start public intake</a>
          <a routerLink="/login" class="login-link">Staff login</a>
        </nav>
      </header>

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
              <a routerLink="/intake" class="btn btn-primary">Start public intake</a>
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

        <section id="about" class="about-section" aria-labelledby="about-title">
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

        <section id="services" class="services-section" aria-labelledby="services-title">
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
          <a routerLink="/intake" class="btn btn-primary btn-large">Complete intake form</a>
        </section>
      </main>
    </div>
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:linear-gradient(#fbf4ea,#edf3ef);color:#172033}.public-shell{max-width:1180px;margin:auto;padding:24px 20px 72px;overflow-x:hidden}.topbar,.nav,.actions,.intake-band{display:flex;align-items:center}.topbar{justify-content:space-between;gap:16px;margin-bottom:30px;flex-wrap:wrap;padding:14px 16px;border:1px solid #e2d9cf;border-radius:999px;background:#fffbf4}.brand{color:#0f2854;font-weight:800;text-decoration:none}.nav{flex-wrap:wrap;gap:10px}.nav a{color:#2f5f63;text-decoration:none;font-weight:700;min-height:44px;display:inline-flex;align-items:center;border-radius:999px;padding:0 .7rem}.nav a:focus-visible,.btn:focus-visible,.brand:focus-visible,.staff-note a:focus-visible{outline:3px solid #d8ac65;outline-offset:3px}.nav-primary{background:#0f2854;color:#fff!important}.login-link{border:1px solid #0f28542e;color:#0f2854!important;background:#fff}.hero{display:grid;grid-template-columns:1fr minmax(340px,.85fr);gap:clamp(24px,5vw,56px);align-items:center;padding:clamp(28px,5vw,54px);margin-bottom:24px;background:#ffffffcc;border:1px solid #e2d9cf;border-radius:34px}.eyebrow,.section-kicker{margin:0 0 10px;text-transform:uppercase;letter-spacing:.12em;font-size:.75rem;color:#a96f25;font-weight:800}h1,h2{margin:0 0 14px;color:#0f2854;font-family:Georgia,serif;line-height:1.05}h1{font-size:clamp(2.25rem,5.8vw,4.6rem);letter-spacing:-.045em}h2{font-size:clamp(1.7rem,3vw,2.55rem)}h3{margin:0 0 8px;color:#0f2854}.lede,p{line-height:1.65}.lede,.card p,.section-heading p{color:#344055;max-width:760px}.lede{font-size:1.13rem;margin:0}.actions{flex-wrap:wrap;gap:12px;margin-top:26px}.btn{text-decoration:none;border-radius:999px;padding:.95rem 1.24rem;min-height:48px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;text-align:center}.btn-primary{background:#0f2854;color:#fff}.btn-secondary{background:#fff;color:#0f2854;border:1px solid #0f28542e}.btn-tertiary{background:#0f285414;color:#0f2854}.staff-note{margin:18px 0 0;color:#5d6472}.staff-note a{color:#2f5f63;font-weight:800}.hero-image-card{position:relative;margin:0;min-height:540px;border-radius:32px;overflow:hidden;background:#d9c5ac}.hero-image-card img{width:100%;height:100%;min-height:540px;object-fit:cover;display:block}.hero-image-card figcaption{position:absolute;left:18px;right:18px;bottom:18px;z-index:1;padding:16px;border-radius:22px;background:#fffbf4eb;color:#344055}.hero-image-card span,.trust-card strong{display:block;color:#0f2854;font-weight:900}.about-section{display:grid;grid-template-columns:1.2fr .8fr;gap:20px;margin-bottom:24px}.card,.trust-card,.services-section,.intake-band{background:#ffffffe0;border:1px solid #e2d9cf;border-radius:28px;padding:30px}.trust-card{display:grid;gap:16px;align-content:center;background:#f3f8f3}.service-list article{padding:18px;border-radius:22px;background:#fff;border:1px solid #2f5f631f}.trust-card span,.service-list p{color:#4b5568}.services-section{margin-bottom:24px}.section-heading{max-width:740px;margin-bottom:22px}.service-list{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.card-number{color:#a96f25;font-weight:900}.intake-band{justify-content:space-between;gap:24px;background:#0f2854;color:#fff}.intake-band h2{color:#fff}.intake-band .section-kicker{color:#f4d59f}.intake-band p{color:#ffffffdb;margin-bottom:0}.intake-band .btn-primary{background:#fff;color:#0f2854;flex:0 0 auto}@media(max-width:900px){.hero,.about-section{grid-template-columns:1fr}.hero-image-card{order:-1}.hero-image-card,.hero-image-card img{min-height:400px}.service-list{grid-template-columns:1fr}.intake-band{align-items:flex-start;flex-direction:column}}@media(max-width:700px){.public-shell{padding:16px 14px 48px}.topbar{align-items:flex-start;border-radius:24px}.hero,.card,.trust-card,.services-section,.intake-band{padding:22px;border-radius:22px}.hero-image-card,.hero-image-card img{min-height:340px;max-height:420px}.hero-image-card figcaption{left:12px;right:12px;bottom:12px}.actions,.btn,.intake-band .btn-primary{width:100%}}
  `],
})
export class PublicHomeComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly authService = inject(AuthService);

  readonly isLoggedIn = this.authService.isLoggedIn();

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
}
