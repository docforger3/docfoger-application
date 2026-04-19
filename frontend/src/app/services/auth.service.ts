import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/** User profile extracted from the Google JWT ID token */
export interface GoogleUser {
  id: string;      // Google 'sub' claim
  name: string;
  email: string;
  picture: string; // avatar URL
  givenName: string;
  familyName: string;
}

/** Minimal type for GIS credential response */
interface CredentialResponse {
  credential: string;
  select_by: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _user = new BehaviorSubject<GoogleUser | null>(null);

  /** Observable of current signed-in user (null when not signed in) */
  user$: Observable<GoogleUser | null> = this._user.asObservable();

  /** Convenience getter */
  get currentUser(): GoogleUser | null { return this._user.value; }
  get isLoggedIn(): boolean { return !!this._user.value; }

  private _gisReady = false;

  constructor(private ngZone: NgZone) {
    // Restore session from localStorage on startup
    this._restoreSession();
    // Initialise GIS once the script has loaded
    this._waitForGis();
  }

  // ─── Initialisation ──────────────────────────────────────────

  /** Poll until the google.accounts.id API is available, then initialise */
  private _waitForGis(): void {
    const check = () => {
      if ((window as any).google?.accounts?.id) {
        this._initGis();
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  }

  private _initGis(): void {
    const google = (window as any).google;
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: CredentialResponse) => {
        // Google calls this callback outside Angular zone
        this.ngZone.run(() => this._handleCredentialResponse(response));
      },
      auto_select: true,       // auto-select returning users
      cancel_on_tap_outside: true
    });
    this._gisReady = true;

    // If user is not logged in, show One Tap prompt
    if (!this.isLoggedIn) {
      google.accounts.id.prompt();
    }
  }

  // ─── Sign In ──────────────────────────────────────────────────

  /** Trigger the Google Sign-In popup programmatically */
  signIn(): void {
    if (!this._gisReady) {
      console.warn('[AuthService] Google Identity Services not ready yet');
      return;
    }
    const google = (window as any).google;
    // Use the One Tap / popup flow
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // Fallback: render a hidden Google button and click it programmatically
        this._fallbackSignIn();
      }
    });
  }

  /** Fallback: create an invisible Google button, click it, then remove it */
  private _fallbackSignIn(): void {
    const google = (window as any).google;
    const div = document.createElement('div');
    div.id = '__gsi_fallback';
    div.style.position = 'fixed';
    div.style.top = '-9999px';
    document.body.appendChild(div);
    google.accounts.id.renderButton(div, {
      type: 'standard',
      size: 'large',
      theme: 'filled_black'
    });
    // Wait a frame for the iframe to render, then click it
    setTimeout(() => {
      const btn = div.querySelector('div[role="button"]') as HTMLElement;
      btn?.click();
      // Clean up after a delay
      setTimeout(() => div.remove(), 5000);
    }, 300);
  }

  // ─── Credential Handling ──────────────────────────────────────

  private _handleCredentialResponse(response: CredentialResponse): void {
    const payload = this._decodeJwt(response.credential);
    if (!payload) return;

    const user: GoogleUser = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      givenName: payload.given_name,
      familyName: payload.family_name
    };

    this._user.next(user);
    localStorage.setItem('docforge_user', JSON.stringify(user));
    localStorage.setItem('docforge_token', response.credential);
  }

  /** Decode a JWT without verification (frontend-only — verification happens on Google's side) */
  private _decodeJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch {
      console.error('[AuthService] Failed to decode JWT');
      return null;
    }
  }

  // ─── Session Restore ──────────────────────────────────────────

  private _restoreSession(): void {
    try {
      const stored = localStorage.getItem('docforge_user');
      if (stored) {
        this._user.next(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem('docforge_user');
    }
  }

  // ─── Sign Out ─────────────────────────────────────────────────

  signOut(): void {
    const google = (window as any).google;
    if (google?.accounts?.id) {
      google.accounts.id.disableAutoSelect();
    }
    this._user.next(null);
    localStorage.removeItem('docforge_user');
    localStorage.removeItem('docforge_token');
  }
}
