import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CryptoService, Crypto } from '../../services/crypto.service';
import { Observable } from 'rxjs';
import { Chart, TimeScale } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent]
})
export class AssetDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('priceChart') priceChart!: ElementRef;
  assetId: string = '';
  asset$: Observable<Crypto>;
  priceHistory$: Observable<any>;
  chart: any;
  currentTheme = 'system';

  constructor(
    private route: ActivatedRoute,
    private cryptoService: CryptoService
  ) {
    this.assetId = this.route.snapshot.paramMap.get('id') || '';
    this.asset$ = this.cryptoService.getAssetDetails(this.assetId);
    this.priceHistory$ = this.cryptoService.getAssetHistory(this.assetId);
  }

  ngOnInit(): void {
    this.currentTheme = localStorage.getItem('theme') || 'system';
  }

  ngAfterViewInit() {
    this.priceHistory$.subscribe(history => {
      if (history && history.length > 0) {
        this.initChart(history);
      }
    });
  }

  initChart(history: any[]) {
    const ctx = this.priceChart.nativeElement.getContext('2d');

    const gridColor = this.currentTheme === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)';

    const sortedHistory = [...history].sort((a, b) =>
      new Date(a.time).getTime() - new Date(b.time).getTime()
    );

    const data = sortedHistory.map(item => ({
      x: new Date(item.time),
      y: parseFloat(item.priceUsd)
    }));

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Price USD',
          data: data,
          borderColor: '#2eae34',
          backgroundColor: 'rgba(46, 174, 52, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context) => {
                return `$${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              displayFormats: {
                day: 'MMM d'
              }
            },
            grid: {
              display: false
            },
            ticks: {
              color: '#666'
            }
          },
          y: {
            grid: {
              color: gridColor
            },
            ticks: {
              color: '#666',
              callback: (value) => {
                return '$' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  formatPrice(price: string): string {
    const numericPrice = parseFloat(price);

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

  formatPercentage(percent: string): string {
    return Number(percent).toFixed(2) + '%';
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

  getPercentageClass(percent: string): string {
    const value = Number(percent);
    return value >= 0 ? 'positive' : 'negative';
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'https://assets.coincap.io/assets/icons/generic@2x.png';
  }

  onThemeChange(theme: string) {
    this.currentTheme = theme;
    this.priceHistory$.subscribe(history => {
      if (history && history.length > 0) {
        this.initChart(history);
      }
    });
  }
} 