import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type GalleryItem = {
  title: string;
  subtitle: string;
  tag: 'All' | 'Date Night' | 'Proposal' | 'Celebration' | 'Corporate';
  imgUrl: string;
};

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.css'],
})
export class GalleryComponent {
  pageTitle = 'Gallery';
  intro =
    'Browse a few past setups and themes. Swap in your real photos whenever you are ready—this layout stays responsive.';

  readonly filters = ['All', 'Date Night', 'Proposal', 'Celebration', 'Corporate'] as const;
  activeFilter: (typeof this.filters)[number] = 'All';

  readonly items: GalleryItem[] = [
    {
      title: 'Sunset Date Night',
      subtitle: 'Neutral tones + candles',
      tag: 'Date Night',
      imgUrl: 'assets/images/picnic-tent-setup.jpg',
    },
    {
      title: 'Park Proposal',
      subtitle: 'Florals + marquee letters',
      tag: 'Proposal',
      imgUrl: 'assets/images/picnic-tent-setup-3.JPG',
    },
    {
      title: 'Birthday Brunch Picnic',
      subtitle: 'Pastels + dessert bar',
      tag: 'Celebration',
      imgUrl: 'assets/images/picnic-table-setup-5.JPG',
    },
    {
      title: 'Team Picnic Setup',
      subtitle: 'Brand-ready + flexible seating',
      tag: 'Corporate',
      imgUrl: 'assets/images/picnic-team-setup.png',
    },
    {
      title: 'Golden Hour Picnic',
      subtitle: 'Boho textures + rugs',
      tag: 'Date Night',
      imgUrl: 'assets/images/picnic-setup-5.jpg',
    },
    {
      title: 'Engagement Surprise',
      subtitle: 'Rose petals + premium decor',
      tag: 'Proposal',
      imgUrl: 'assets/images/picnic-tent-setup-2.JPG',
    },
    {
      title: 'Friends & Mimosas',
      subtitle: 'Bright + airy styling',
      tag: 'Celebration',
      imgUrl: 'assets/images/picnic-setup-3.JPG',
    },
    {
      title: 'Client Appreciation',
      subtitle: 'Elevated tablescape',
      tag: 'Corporate',
      imgUrl: 'assets/images/picnic-table-setup-4.JPG',
    },
    {
      title: 'Lakeside Relax',
      subtitle: 'Soft neutrals + pillows',
      tag: 'Date Night',
      imgUrl: 'assets/images/lakeside-picnic-setup.png',
    },
    {
      title: 'Garden Moment',
      subtitle: 'Fresh florals + custom signage',
      tag: 'Proposal',
      imgUrl: 'assets/images/picnic-table-setup-3.JPG',
    },
    {
      title: 'Milestone Celebration',
      subtitle: 'Balloon arch + photo spot',
      tag: 'Celebration',
      imgUrl: 'assets/images/picnic-setup-milestone.png',
    },
    {
      title: 'Offsite Team Day',
      subtitle: 'Minimal + modern',
      tag: 'Corporate',
      imgUrl: 'assets/images/picnic-table-setup-1.JPG',
    },
  ];

  get filteredItems(): GalleryItem[] {
    if (this.activeFilter === 'All') return this.items;
    return this.items.filter((item) => item.tag === this.activeFilter);
  }

  setFilter(filter: (typeof this.filters)[number]) {
    this.activeFilter = filter;
  }

  trackByIndex = (i: number) => i;
}
