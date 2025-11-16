import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  message: string = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getHello().subscribe((res: any) => {
      this.message = res.message;
    });
  }
}
