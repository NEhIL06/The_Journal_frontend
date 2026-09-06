import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import { getApiErrorMessage } from '../../../core/http/api-error';
import { JournalEntryRequest } from '../../../core/models/journal.models';
import { JournalService } from '../../../core/services/journal.service';
import { AppHeader } from '../../../shared/components/app-header/app-header';
import { StatusMessage } from '../../../shared/components/status-message/status-message';

@Component({
  selector: 'app-journal-editor',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AppHeader, StatusMessage],
  templateUrl: './editor.html',
})
export class JournalEditor implements OnInit {
  private readonly journals = inject(JournalService);
  private readonly route = inject(ActivatedRoute);

  readonly mode: 'create' | 'edit' = this.route.snapshot.data['mode'] ?? 'create';
  readonly entryId = this.route.snapshot.paramMap.get('id');
  readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)],
    }),
    content: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(5000)],
    }),
  });

  loading = false;
  saving = false;
  submitted = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    if (this.mode === 'edit' && this.entryId) this.loadEntry(this.entryId);
  }

  submit(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const request: JournalEntryRequest = { title: value.title.trim(), content: value.content.trim() };
    const operation: Observable<unknown> = this.mode === 'edit' && this.entryId
      ? this.journals.update(this.entryId, request)
      : this.journals.create(request);

    this.saving = true;
    operation.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => {
        this.successMessage = this.mode === 'edit' ? 'Your entry has been updated.' : 'Your entry has been saved.';
        this.form.markAsPristine();
      },
      error: (error) => (this.errorMessage = getApiErrorMessage(error)),
    });
  }

  private loadEntry(id: string): void {
    this.loading = true;
    this.journals.get(id).pipe(finalize(() => (this.loading = false))).subscribe({
      next: (entry) => this.form.setValue({ title: entry.title, content: entry.content }),
      error: (error) => (this.errorMessage = getApiErrorMessage(error)),
    });
  }
}
