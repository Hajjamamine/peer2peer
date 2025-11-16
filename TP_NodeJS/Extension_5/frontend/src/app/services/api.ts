import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private BASE_URL = 'http://localhost:3000/api'; // Express backend

  constructor(private http: HttpClient) { }

  getHello(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/hello`);
  }

}
