import { Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { About } from './about/about';
import { PrivacyPolicy } from './privacy-policy/privacy-policy';
import { Gallery } from './gallery/gallery';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'about', component: About },
  // { path: 'gallery', component: Gallery },
  { path: 'privacy-policy', component: PrivacyPolicy },
];
