import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type Step = { title: string; body: string };
type PolicyCard = { title: string; body: string };

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './how-it-works.html',
  styleUrls: ['./how-it-works.css'],
})
export class HowItWorksComponent {
  pageTitle = 'How It Works';
  intro =
    'From booking to cleanup, we handle the details so you can show up and enjoy a beautifully styled experience.';

  steps: Step[] = [
    {
      title: 'Book your experience',
      body: 'Choose a package, pick a date, and share your location and occasion details.',
    },
    {
      title: 'We set up before you arrive',
      body: 'Our team handles the full setup and ensures everything is ready when your party arrives.',
    },
    {
      title: 'Enjoy your time',
      body: 'We’ll help you get settled comfortably, then you’re free to relax and soak it all in.',
    },
    {
      title: 'We return for cleanup',
      body: 'When your reservation ends, we come back to pack everything up—no stress, no mess.',
    },
  ];

  bookingNotes: PolicyCard[] = [
    {
      title: 'Special events booking window',
      body: 'For special events, bookings are typically secured at least 1 month in advance. For micro-weddings, plan for 3 months in advance. If your timeline is shorter, reach out and we’ll do our best to help.',
    },
    {
      title: 'Food & beverages',
      body: 'We can include non-alcoholic beverages and a fresh fruit arrangement. Alcohol is not provided. You can bring your own food and drinks, or add premium boards and add-ons.',
    },
  ];

  policies: PolicyCard[] = [
    {
      title: 'Rescheduling',
      body: 'If you need to reschedule, we’ll work with you to find a new date within a set window from the original booking (policies vary by package). Please give notice as early as possible.',
    },
    {
      title: 'Cancellations',
      body: 'Cancellations close to the event date may be partially refundable depending on timing. No-shows are typically non-refundable.',
    },
    {
      title: 'Weather plan',
      body: 'In cases of inclement weather, we’ll contact you to coordinate an indoor alternative or reschedule. Refunds/reschedules may vary by severity and timing.',
    },
  ];

  ctaTitle = 'Ready to plan your picnic?';
  ctaBody =
    'Tell us your occasion, guest count, and ideal vibe—we’ll recommend a setup and confirm availability.';
}
