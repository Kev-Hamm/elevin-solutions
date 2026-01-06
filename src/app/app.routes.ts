import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { HowItWorksComponent } from './pages/how-it-works/how-it-works';
import { GalleryComponent } from './pages/gallery/gallery';
import { PackagesComponent } from './pages/packages/packages';

export const routes: Routes = [
  // Home landing page
  { path: '', component: HomeComponent },

  // How it works
  { path: 'how-it-works', component: HowItWorksComponent },

  // Gallery
  { path: 'gallery', component: GalleryComponent },

  // Packages page
  { path: 'packages', component: PackagesComponent },

  // Fallback
  { path: '**', redirectTo: '' },
];
