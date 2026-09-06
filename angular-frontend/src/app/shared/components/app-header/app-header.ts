import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './app-header.html',
})
export class AppHeader {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  readonly userName = this.auth.getUserName();
  isDark = this.document.documentElement.classList.contains('dark');

  toggleTheme(): void {
    this.isDark = !this.isDark;
    this.document.documentElement.classList.toggle('dark', this.isDark);
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
