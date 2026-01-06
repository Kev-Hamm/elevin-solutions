import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type Highlight = {
  value: string;
  label: string;
};

type Step = {
  title: string;
  text: string;
};

type Faq = {
  q: string;
  a: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent {
  readonly brand = 'Picnic & Co.';
  readonly tagline =
    'Curated luxury picnic experiences, beautifully styled and effortlessly hosted.';

  readonly highlights: Highlight[] = [
    { value: '120+', label: 'Luxe picnics hosted' },
    { value: '4.9/5', label: 'Guest-rated experiences' },
    { value: 'Full-service', label: 'Setup to pack-down' },
  ];

  readonly steps: Step[] = [
    {
      title: 'Choose a Package',
      text: 'Pick a style that fits your moment - romantic, celebratory, or elevated.',
    },
    {
      title: 'Pick Date & Location',
      text: "Select your time and we'll confirm your ideal spot (or your backyard!).",
    },
    {
      title: 'Arrive & Enjoy',
      text: 'We set everything up. You show up, relax, and soak it all in.',
    },
  ];

  readonly faqs: Faq[] = [
    {
      q: 'How long is the picnic?',
      a: 'Most bookings include 2 hours. Extra time is available as an add-on.',
    },
    {
      q: 'Do you provide food?',
      a: 'We offer optional add-ons (charcuterie, desserts, drinks). You can also BYO.',
    },
    {
      q: 'What if it rains?',
      a: "We'll reschedule or move to a covered location when possible - no stress.",
    },
  ];

  readonly featureTitle = 'Curated, turnkey setups';
  readonly featureCopy =
    'We scout locations, style the scene, and handle the clean-up so you simply arrive and enjoy.';
}
