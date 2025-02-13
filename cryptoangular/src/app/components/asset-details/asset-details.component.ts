import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CryptoService, Crypto } from '../../services/crypto.service';
import { Observable } from 'rxjs';
import { Chart, TimeScale } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

@Component({
  selector: 'app-asset-details',
  templateUrl: './asset-details.component.html',
  styleUrls: ['./asset-details.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AssetDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('priceChart') priceChart!: ElementRef;
  assetId: string = '';
  asset$: Observable<Crypto>;
  priceHistory$: Observable<any>;
  chart: any;

  constructor(
    private route: ActivatedRoute,
    private cryptoService: CryptoService
  ) {
    this.assetId = this.route.snapshot.paramMap.get('id') || '';
    this.asset$ = this.cryptoService.getAssetDetails(this.assetId);
    this.priceHistory$ = this.cryptoService.getAssetHistory(this.assetId);
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.priceHistory$.subscribe(history => {
      if (history && history.length > 0) {
        this.initChart(history);
      }
    });
  }

  initChart(history: any[]) {
    const ctx = this.priceChart.nativeElement.getContext('2d');
    const data = history.map(item => ({
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
              color: 'rgba(255, 255, 255, 0.1)'
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

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'https://assets.coincap.io/assets/icons/generic@2x.png';
  }
} 