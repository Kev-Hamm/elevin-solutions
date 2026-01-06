import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type PackageCard = {
  title: string;
  description: string;
  price: string;
  badge?: string;
};

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './packages.html',
  styleUrls: ['./packages.css'],
})
export class PackagesComponent {
  readonly packages: PackageCard[] = [
    {
      title: 'Date Night',
      description:
        'A romantic setup for two with cozy seating, table styling, and candlelight vibes.',
      price: 'From $249',
      badge: 'Popular',
    },
    {
      title: 'Celebration',
      description:
        'Perfect for birthdays & small gatherings with upgraded décor and more place settings.',
      price: 'From $349',
    },
    {
      title: 'Proposal',
      description: 'An elevated, photo-ready moment with premium florals and custom details.',
      price: 'From $499',
      badge: 'Signature',
    },
    {
      title: 'Corporate Picnic',
      description:
        'Team-friendly setups with flexible seating, branding options, and add-on catering.',
      price: 'From $699',
    },
  ];
}
