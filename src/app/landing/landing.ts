import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Nav } from '../nav/nav';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Nav],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
})
export class Landing {
  name = signal('');
  email = signal('');
  message = signal('');
  document: any;

  submitForm() {
    const payload = {
      name: this.name(),
      email: this.email(),
      message: this.message(),
    };

    console.log('Housing inquiry submitted:', payload);
    alert('Thank you for your inquiry. We will contact you soon.');

    this.name.set('');
    this.email.set('');
    this.message.set('');
  }
}
