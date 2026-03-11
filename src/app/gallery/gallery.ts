import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Nav } from '../nav/nav';

type GalleryItem = {
  src: string;
  alt: string;
  title: string;
  description: string;
};

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, Nav],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css'],
})
export class Gallery {
  readonly items: GalleryItem[] = [
    {
      src: 'assets/blue-oasis-wheelchair-senior.png',
      alt: 'Resident and caregiver in supportive housing community',
      title: 'Accessible Living Spaces',
      description: 'Barrier-free layouts designed for comfort, safety, and independence.',
    },
    {
      src: 'assets/blue-oasis-veteran-senior.png',
      alt: 'Two residents spending time together in community housing',
      title: 'Community Connection',
      description: 'Shared spaces that help residents build meaningful relationships.',
    },
    {
      src: 'assets/blue-oasis-wheelchair-senior.png',
      alt: 'Supportive housing environment with mobility-friendly setup',
      title: 'Supportive Environment',
      description: 'Thoughtfully managed homes with a focus on dignity and well-being.',
    },
    {
      src: 'assets/blue-oasis-veteran-senior.png',
      alt: 'Residents in a welcoming and inclusive housing setting',
      title: 'Inclusive Communities',
      description: 'Safe, respectful spaces for veterans, seniors, and individuals with disabilities.',
    },
  ];
}
