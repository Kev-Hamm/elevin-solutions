import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Nav } from '../nav/nav';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, Nav],
  templateUrl: './about.html',
  styleUrls: ['./about.css'],
})
export class About {}
