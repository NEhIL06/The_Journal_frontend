import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../../core/http/api-error';
import { JournalEntry } from '../../../core/models/journal.models';
import { JournalService } from '../../../core/services/journal.service';
import { AppHeader } from '../../../shared/components/app-header/app-header';
import { StatusMessage } from '../../../shared/components/status-message/status-message';

@Component({
  selector: 'app-journal-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, AppHeader, StatusMessage],
  templateUrl: './detail.html',
})
export class JournalDetail implements OnInit {
  private readonly journals = inject(JournalService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  entry: JournalEntry | null = null;
  loading = true;
  deleting = false;
  errorMessage = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'This entry does not have a valid identifier.';
      this.loading = false;
      return;
    }
    this.journals.get(id).pipe(finalize(() => (this.loading = false))).subscribe({
      next: (entry) => (this.entry = entry),
      error: (error) => (this.errorMessage = getApiErrorMessage(error)),
    });
  }

  deleteEntry(): void {
    if (!this.entry || !globalThis.confirm(`Delete “${this.entry.title}”? This cannot be undone.`)) return;
    this.deleting = true;
    this.journals.delete(this.entry.id).pipe(finalize(() => (this.deleting = false))).subscribe({
      next: () => void this.router.navigate(['/journal']),
      error: (error) => (this.errorMessage = getApiErrorMessage(error)),
    });
  }
}
