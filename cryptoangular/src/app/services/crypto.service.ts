import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Crypto {
  rank: number;
  symbol: string;
  name: string;
  priceUsd: string;
  changePercent24Hr: string;
  marketCapUsd: string;
  volumeUsd24Hr: string;
}

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private apiUrl = 'https://api.coincap.io/v2';

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
} 