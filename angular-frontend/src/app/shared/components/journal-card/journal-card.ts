import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JournalEntry } from '../../../core/models/journal.models';

@Component({
  selector: 'app-journal-card',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './journal-card.html',
})
export class JournalCard {
  @Input({ required: true }) entry!: JournalEntry;
  @Output() deleteRequested = new EventEmitter<JournalEntry>();

  sentimentClass(sentiment?: string | null): string {
    return `sentiment-${(sentiment || 'neutral').toLowerCase()}`;
  }
}
