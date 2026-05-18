import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="about-page-shell">
      <a routerLink="/" class="about-brand" aria-label="Elevin Solutions home">
        <img src="assets/elevin-logo.webp" alt="" aria-hidden="true" />
        <span>Elevin Solutions</span>
      </a>

      <section class="about-page-hero" aria-labelledby="about-page-title">
        <p class="section-kicker">About Us</p>
        <h1 id="about-page-title">Building Communities Filled with Compassion and Care</h1>
        <div class="about-page-copy">
          <p>
            Founded in 2016, Elevin Solutions, LLC was created to redefine affordable housing through thoughtfully
            designed shared living communities.
          </p>
          <p>
            Co-living residences offer private and shared rooms plus welcoming community spaces where residents can
            connect, cook, and build relationships.
          </p>
          <p>
            Elevin provides clean, safe, well-managed environments that support financial stability and belonging.
          </p>
          <p>
            Elevin supports hardworking individuals and vulnerable populations with accessible, respectful,
            high-quality shared living.
          </p>
        </div>
        <div class="about-page-actions">
          <a routerLink="/intake" class="btn btn-primary">Start Intake</a>
          <a routerLink="/" class="btn btn-secondary">Back home</a>
        </div>
      </section>
    </main>
  `,
})
export class AboutUsComponent {}
