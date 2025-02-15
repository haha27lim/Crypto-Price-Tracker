import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AssetDetailsComponent } from './components/asset-details/asset-details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'asset/:id', component: AssetDetailsComponent }
];
