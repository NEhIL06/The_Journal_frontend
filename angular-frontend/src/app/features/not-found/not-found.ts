import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `<section class="not-found"><span class="eyebrow">404</span><h1>This page is not in your journal.</h1><p>The link may be old, or the page may have moved.</p><a class="button button-primary" routerLink="/">Return home</a></section>`,
})
export class NotFound {}
