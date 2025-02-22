import { Component, Inject, Input, PLATFORM_ID, Output, EventEmitter } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Crypto {
  id: string;
  name: string;
  symbol: string;
  rank: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
}

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
  showDropdown = false;
  dropdownSuggestions: Crypto[] = [];
  cryptos: Crypto[] = [];
  @Input() currentTheme = 'system';
  @Output() themeChange = new EventEmitter<string>();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme') || 'system';
      this.setTheme(savedTheme);
      this.fetchCryptos();
    }
  }

  fetchCryptos() {
    this.http.get<{data: Crypto[]}>('https://api.coincap.io/v2/assets')
      .subscribe({
        next: (response) => {
          this.cryptos = response.data;
        },
        error: (error) => {
          console.error('Error fetching crypto data:', error);
        }
      });
  }

  onSearch() {
    if (!this.searchQuery.trim()) {
      this.showDropdown = false;
      this.dropdownSuggestions = [];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.dropdownSuggestions = this.cryptos
      .filter(crypto => 
        crypto.name.toLowerCase().includes(query) || 
        crypto.symbol.toLowerCase().includes(query)
      )
      .slice(0, 5); // Limit to top 5 suggestions

    this.showDropdown = this.dropdownSuggestions.length > 0;
  }

  selectCrypto(crypto: Crypto) {
    this.searchQuery = crypto.name;
    this.showDropdown = false;
    
    // Get the current URL
    const currentUrl = this.router.url;
    const targetUrl = `/asset/${crypto.id}`;

    // If we're already on the asset details page, use navigation with refresh
    if (currentUrl.startsWith('/asset/')) {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/asset', crypto.id]);
      });
    } else {
      // For other pages, normal navigation is fine
      this.router.navigate(['/asset', crypto.id]);
    }
  }

  onSearchFocusOut() {

    setTimeout(() => {
      this.showDropdown = false;
    }, 200);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/placeholder-crypto.png';
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