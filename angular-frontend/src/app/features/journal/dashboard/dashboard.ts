import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { getApiErrorMessage } from '../../../core/http/api-error';
import { JournalEntry } from '../../../core/models/journal.models';
import { JournalService } from '../../../core/services/journal.service';
import { AppHeader } from '../../../shared/components/app-header/app-header';
import { JournalCard } from '../../../shared/components/journal-card/journal-card';
import { StatusMessage } from '../../../shared/components/status-message/status-message';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, AppHeader, JournalCard, StatusMessage],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly journals = inject(JournalService);

  entries: JournalEntry[] = [];
  greeting = '';
  loading = true;
  deletingId: string | null = null;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadEntries();
    this.journals.greeting().subscribe({ next: (greeting) => (this.greeting = greeting), error: () => undefined });
  }

  loadEntries(): void {
    this.loading = true;
    this.errorMessage = '';
    this.journals.list().pipe(finalize(() => (this.loading = false))).subscribe({
      next: (entries) =>
        (this.entries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())),
      error: (error) => (this.errorMessage = getApiErrorMessage(error)),
    });
  }

  deleteEntry(entry: JournalEntry): void {
    if (!globalThis.confirm(`Delete “${entry.title}”? This cannot be undone.`)) return;
    this.deletingId = entry.id;
    this.errorMessage = '';
    this.successMessage = '';
    this.journals.delete(entry.id).pipe(finalize(() => (this.deletingId = null))).subscribe({
      next: () => {
        this.entries = this.entries.filter((item) => item.id !== entry.id);
        this.successMessage = 'Journal entry deleted.';
      },
      error: (error) => (this.errorMessage = getApiErrorMessage(error)),
    });
  }
}
