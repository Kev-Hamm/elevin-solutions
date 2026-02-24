import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Nav } from '../nav/nav';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, Nav],
  templateUrl: './privacy-policy.html',
  styleUrls: ['./privacy-policy.css'],
})
export class PrivacyPolicy {}
