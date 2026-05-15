import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-health-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="health" [class.up]="status==='ok'" [class.down]="status!=='ok'">
      <span class="dot"></span>
      <span>{{ label }}</span>
    </div>
  `,
  styles: [`
    .health { display: inline-flex; align-items: center; gap: .5rem; padding: .25rem .5rem; border-radius: 999px; background: #f3f4f6; color: #374151; font-size: .9rem; }
    .health.up { background: #e6f4f4; color: #2f6f73; }
    .health.down { background: #fef2f2; color: #991b1b; }
    .dot { width: .6rem; height: .6rem; border-radius: 50%; background: currentColor; display: inline-block; }
  `]
})
export class HealthIndicatorComponent implements OnInit {
  status: 'ok' | 'down' | 'unknown' = 'unknown';
  label = 'Checking API...';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getHealth().subscribe({
      next: (res) => { this.status = res?.status === 'ok' ? 'ok' : 'down'; this.label = this.status === 'ok' ? 'API online' : 'API issue'; },
      error: () => { this.status = 'down'; this.label = 'API unreachable'; }
    });
  }
}
