import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Crypto {
  id: string;
  rank: number;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
}

export interface HistoryPoint {
  time: number;
  priceUsd: string;
}

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private apiUrl = 'https://rest.coincap.io/v3/';

  constructor(private http: HttpClient) { }

  getAllCryptos(): Observable<Crypto[]> {
    return this.http.get<any>(`${this.apiUrl}/assets?limit=100`)
      .pipe(map(response => response.data));
  }

  getTopGainers(): Observable<Crypto[]> {
    return this.getAllCryptos().pipe(
      map(cryptos => 
        [...cryptos].sort((a, b) => 
          parseFloat(b.changePercent24Hr) - parseFloat(a.changePercent24Hr)
        ).slice(0, 100)
      )
    );
  }

  getTopLosers(): Observable<Crypto[]> {
    return this.getAllCryptos().pipe(
      map(cryptos => 
        [...cryptos].sort((a, b) => 
          parseFloat(a.changePercent24Hr) - parseFloat(b.changePercent24Hr)
        ).slice(0, 100)
      )
    );
  }

  getAssetDetails(id: string): Observable<Crypto> {
    return this.http.get<any>(`${this.apiUrl}/assets/${id}`)
      .pipe(map(response => response.data));
  }

  getAssetHistory(id: string, interval: string = 'd1'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/assets/${id}/history?interval=${interval}`)
      .pipe(map(response => response.data));
  }
} 