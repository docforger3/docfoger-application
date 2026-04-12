import { Component, Input, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-adsense-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ad-container" [style.margin]="margin">
      <ins class="adsbygoogle"
           [style.display]="display"
           [attr.data-ad-client]="publisherId"
           [attr.data-ad-slot]="slotId"
           [attr.data-ad-format]="format"
           [attr.data-full-width-responsive]="responsive">
      </ins>
    </div>
  `,
  styles: [`
    .ad-container {
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      min-height: 50px;
      width: 100%;
    }
  `]
})
export class AdsenseBannerComponent implements OnInit, AfterViewInit {
  @Input() slotId: string = ''; // Required: From AdSense dashboard
  @Input() format: string = 'auto';
  @Input() display: string = 'block';
  @Input() responsive: string = 'true';
  @Input() margin: string = '20px 0';

  publisherId = environment.adsensePublisherId;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.pushAd();
    }
  }

  private pushAd(): void {
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense push failed', e);
    }
  }
}
