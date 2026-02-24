import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrls: ['./nav.css'],
})
export class Nav {
  isOpen = false;

  toggleNav() {
    this.isOpen = !this.isOpen;
  }

  closeNav() {
    this.isOpen = false;
  }
}
