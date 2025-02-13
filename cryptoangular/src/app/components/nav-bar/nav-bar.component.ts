import { Component, Inject, Input, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
  searchQuery = '';
  showThemeMenu = false;
  @Input() currentTheme = 'system';
  @Output() themeChange = new EventEmitter<string>();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme') || 'system';
      this.setTheme(savedTheme);
    }
  }

  onSearch() {
    // Implement search logic
  }

  onRefresh() {
    if (isPlatformBrowser(this.platformId)) {
      window.location.reload();
    }
  }

  setTheme(theme: string) {
    this.currentTheme = theme;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      this.themeChange.emit(theme);
    }
    this.showThemeMenu = false;
  }

  toggleThemeMenu() {
    this.showThemeMenu = !this.showThemeMenu;
  }
} 