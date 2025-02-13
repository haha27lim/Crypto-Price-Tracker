import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

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
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: []
})
export class AppComponent implements OnInit {
  title = 'Crypto Dashboard';
  currentView: 'all' | 'gainers' | 'losers' = 'all';
  loading = true;
  cryptos: Crypto[] = [];
  filteredCryptos: Crypto[] = [];
  currentTheme: 'light' | 'dark' | 'system' = 'system';
  showThemeMenu = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.fetchCryptos();
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
      // Listen for system theme changes
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', this.handleSystemThemeChange.bind(this));
      }
    }
  }

  initializeTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
      if (savedTheme) {
        this.currentTheme = savedTheme;
      }
      this.applyTheme();
    }
  }

  toggleThemeMenu() {
    this.showThemeMenu = !this.showThemeMenu;
  }

  setTheme(theme: 'light' | 'dark' | 'system') {
    this.currentTheme = theme;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', theme);
      this.applyTheme();
    }
    this.showThemeMenu = false;
  }

  applyTheme() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.currentTheme === 'system') {
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-theme', isDarkMode);
        document.body.classList.toggle('light-theme', !isDarkMode);
      } else {
        document.body.classList.toggle('dark-theme', this.currentTheme === 'dark');
        document.body.classList.toggle('light-theme', this.currentTheme === 'light');
      }
    }
  }

  handleSystemThemeChange(e: MediaQueryListEvent) {
    if (this.currentTheme === 'system') {
      this.applyTheme();
    }
  }

  switchView(view: 'all' | 'gainers' | 'losers') {
    this.currentView = view;
    this.filterCryptos();
  }

  filterCryptos() {
    switch (this.currentView) {
      case 'gainers':
        this.filteredCryptos = [...this.cryptos]
          .sort((a, b) => parseFloat(b.changePercent24Hr) - parseFloat(a.changePercent24Hr))
          .slice(0, 10);
        break;
      case 'losers':
        this.filteredCryptos = [...this.cryptos]
          .sort((a, b) => parseFloat(a.changePercent24Hr) - parseFloat(b.changePercent24Hr))
          .slice(0, 10);
        break;
      default:
        this.filteredCryptos = this.cryptos;
    }
  }

  fetchCryptos() {
    this.loading = true;
    this.http.get<any>('https://api.coincap.io/v2/assets')
      .subscribe(response => {
        this.cryptos = response.data;
        this.filterCryptos();
        this.loading = false;
      });
  }

  formatPrice(price: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Number(price));
  }

  formatPercentage(percent: string): string {
    return Number(percent).toFixed(2) + '%';
  }

  formatMarketCap(marketCap: string): string {
    const value = Number(marketCap);
    if (value >= 1e9) {
      return '$' + (value / 1e9).toFixed(2) + 'B';
    }
    return '$' + (value / 1e6).toFixed(2) + 'M';
  }

  getPercentageClass(percent: string): string {
    const value = Number(percent);
    return value >= 0 ? 'positive' : 'negative';
  }

  onImageError(event: any) {
    event.target.src = 'https://assets.coincap.io/assets/icons/generic@2x.png';
  }
}
