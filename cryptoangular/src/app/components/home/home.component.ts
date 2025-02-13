import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class HomeComponent implements OnInit {
  cryptos: Crypto[] = [];
  filteredCryptos: Crypto[] = [];
  loading = true;
  searchQuery = '';
  currentView = 'all';
  currentTheme = 'system';
  showThemeMenu = false;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.fetchCryptos();
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
    }
  }

  fetchCryptos() {
    this.loading = true;
    this.http.get<{data: Crypto[]}>('https://api.coincap.io/v2/assets')
      .subscribe({
        next: (response) => {
          this.cryptos = response.data;
          this.filteredCryptos = this.cryptos;
          this.loading = false;
          this.applyCurrentView();
        },
        error: (error) => {
          console.error('Error fetching crypto data:', error);
          this.loading = false;
        }
      });
  }

  handleSearch() {
    if (this.cryptos) {
      this.filteredCryptos = this.cryptos.filter(crypto => 
        crypto.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      this.applyCurrentView();
    }
  }

  switchView(view: string) {
    this.currentView = view;
    this.applyCurrentView();
  }

  applyCurrentView() {
    let filtered = [...this.cryptos];
    if (this.searchQuery) {
      filtered = filtered.filter(crypto => 
        crypto.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    switch (this.currentView) {
      case 'gainers':
        filtered.sort((a, b) => parseFloat(b.changePercent24Hr) - parseFloat(a.changePercent24Hr));
        filtered = filtered.slice(0, 20);
        break;
      case 'losers':
        filtered.sort((a, b) => parseFloat(a.changePercent24Hr) - parseFloat(b.changePercent24Hr));
        filtered = filtered.slice(0, 20);
        break;
    }

    this.filteredCryptos = filtered;
  }

  formatPrice(price: string): string {
    const numericPrice = parseFloat(price);
    
    // For prices less than $1
    if (numericPrice < 1) {
      // Find the first non-zero digit after decimal
      const decimalStr = numericPrice.toString().split('.')[1];
      let significantIndex = 0;
      for (let i = 0; i < decimalStr.length; i++) {
        if (decimalStr[i] !== '0') {
          significantIndex = i;
          break;
        }
      }
      
      // Show 4 digits after the first significant digit
      const decimals = Math.max(significantIndex + 4, 2);
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(numericPrice);
    }
    
    // For prices $1 and above
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericPrice);
  }

  formatMarketCap(marketCap: string): string {
    const numericValue = parseFloat(marketCap);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      notation: 'standard'
    }).format(numericValue);
  }
  
  formatVolume(volume: string): string {
    const numericVolume = parseFloat(volume);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      notation: 'standard'
    }).format(numericVolume);
  }

  formatPercentage(percent: string): string {
    const value = parseFloat(percent);
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  getPercentageClass(percent: string): string {
    return parseFloat(percent) >= 0 ? 'positive' : 'negative';
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/placeholder-crypto.png';
  }

  initializeTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme') || 'system';
      this.setTheme(savedTheme);
    }
  }

  setTheme(theme: string) {
    this.currentTheme = theme;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('theme', theme);
    }
    this.showThemeMenu = false;
  }

  toggleThemeMenu() {
    this.showThemeMenu = !this.showThemeMenu;
  }

  onThemeChange(theme: string) {
    this.currentTheme = theme;
    // Apply theme-specific styles or trigger other theme-related logic
  }
} 