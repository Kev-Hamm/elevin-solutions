import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <main class="privacy-page" aria-labelledby="privacy-title">
      <nav class="privacy-nav" aria-label="Privacy policy navigation">
        <a routerLink="/" class="brand-link">
          <span class="brand-mark" aria-hidden="true">E</span>
          <span>Elevin Solutions</span>
        </a>
        <a routerLink="/intake" class="btn btn-primary">Start Intake</a>
      </nav>

      <article class="privacy-card">
        <p class="section-kicker">Privacy Policy</p>
        <h1 id="privacy-title">Elevin Solutions Privacy Policy</h1>
        <p class="effective-date">Effective date: January 3, 2026</p>

        <section>
          <h2>Information We Collect</h2>
          <p>
            We may collect contact details, intake information, referral information, housing needs, and other details
            submitted through Elevin Solutions forms or direct communications.
          </p>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <p>
            We use submitted information to review housing requests, coordinate follow-up, evaluate placement fit,
            support operations, communicate with applicants or referral partners, and maintain required records.
          </p>
        </section>

        <section>
          <h2>Sharing Of Information</h2>
          <p>
            Elevin Solutions does not sell personal information. We may share information only as needed to operate
            services, comply with law, protect safety, or coordinate care and placement with authorized parties.
          </p>
        </section>

        <section>
          <h2>Data Security</h2>
          <p>
            We use reasonable administrative, technical, and physical safeguards to protect information submitted to
            us. No online system can be guaranteed completely secure, but sensitive information should be handled only
            by authorized staff for legitimate workflow needs.
          </p>
        </section>

        <section>
          <h2>Cookies And Tracking Technologies</h2>
          <p>
            Our site may use basic cookies or similar technologies to support site functionality, security, analytics,
            and user experience.
          </p>
        </section>

        <section>
          <h2>Third-Party Links</h2>
          <p>
            Our website may link to third-party websites. Elevin Solutions is not responsible for the privacy practices
            or content of those external sites.
          </p>
        </section>

        <section>
          <h2>Children's Privacy</h2>
          <p>
            Our services and public intake workflow are intended for adults. We do not knowingly collect information
            from children through this website.
          </p>
        </section>

        <section>
          <h2>Your Choices</h2>
          <p>
            You may contact us to ask questions about information you submitted or to request updates where appropriate.
          </p>
        </section>

        <section>
          <h2>Changes To This Privacy Policy</h2>
          <p>
            We may update this policy from time to time. The effective date above reflects the current version.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            Questions about this policy can be sent to
            <a href="mailto:admin@elevinsolutions.us">admin&#64;elevinsolutions.us</a>.
          </p>
        </section>
      </article>
    </main>
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:linear-gradient(#fbf4ea,#edf3ef);color:#172033}
    .privacy-page{width:min(100%,960px);margin:0 auto;padding:24px 20px 72px}
    .privacy-nav{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:24px}
    .brand-link{display:inline-flex;align-items:center;gap:10px;color:#0f2854;text-decoration:none;font-weight:900}
    .brand-mark{display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:50%;background:#0f2854;color:#fff;font-family:Georgia,serif;font-size:1.35rem}
    .btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:.8rem 1.1rem;border-radius:999px;text-decoration:none;font-weight:800}
    .btn-primary{background:#0f2854;color:#fff}
    .privacy-card{background:#fffbf4;border:1px solid #e2d9cf;border-radius:28px;padding:clamp(24px,5vw,48px);box-shadow:0 18px 44px rgba(15,40,84,.1)}
    .section-kicker{margin:0 0 10px;text-transform:uppercase;letter-spacing:.12em;font-size:.75rem;color:#8a5b1e;font-weight:800}
    h1,h2{color:#0f2854;font-family:Georgia,serif;line-height:1.08}
    h1{margin:0 0 10px;font-size:clamp(2.1rem,5vw,3.6rem)}
    h2{margin:28px 0 8px;font-size:1.35rem}
    p{line-height:1.68;color:#344055}
    .effective-date{font-weight:800;color:#2f6f73}
    a{color:#0f2854;font-weight:800}
    @media(max-width:560px){.privacy-page{padding:16px 14px 56px}.privacy-nav{align-items:flex-start;flex-direction:column}.privacy-card{border-radius:20px}}
  `],
})
export class PrivacyPolicyComponent {}
