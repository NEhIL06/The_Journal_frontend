import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { JournalEntry, JournalEntryRequest } from '../models/journal.models';

@Injectable({ providedIn: 'root' })
export class JournalService {
  private readonly http = inject(HttpClient);
  private readonly journalUrl = `${environment.apiBaseUrl}/journal`;

  list(): Observable<JournalEntry[]> {
    return this.http.get<JournalEntry[]>(this.journalUrl).pipe(
      catchError((error: HttpErrorResponse) =>
        error.status === 404 || error.status === 204 ? of([]) : throwError(() => error),
      ),
    );
  }

  get(id: string): Observable<JournalEntry> {
    return this.http.get<JournalEntry>(`${this.journalUrl}/id/${encodeURIComponent(id)}`);
  }

  create(request: JournalEntryRequest): Observable<JournalEntry> {
    return this.http.post<JournalEntry>(this.journalUrl, request);
  }

  update(id: string, request: JournalEntryRequest): Observable<void> {
    return this.http.put<void>(`${this.journalUrl}/id/${encodeURIComponent(id)}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.journalUrl}/id/${encodeURIComponent(id)}`);
  }

  greeting(): Observable<string> {
    return this.http.get(`${environment.apiBaseUrl}/user`, { responseType: 'text' });
  }
}
