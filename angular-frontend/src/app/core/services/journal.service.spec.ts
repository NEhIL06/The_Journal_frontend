import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { JournalService } from './journal.service';

describe('JournalService', () => {
  let service: JournalService;
  let http: HttpTestingController;
  const entry = { id: '507f1f77bcf86cd799439011', title: 'Today', content: 'A note', date: '2026-09-05T10:00:00' };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(JournalService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists journal entries', () => {
    service.list().subscribe((entries) => expect(entries).toEqual([entry]));
    const request = http.expectOne(`${environment.apiBaseUrl}/journal`);
    expect(request.request.method).toBe('GET');
    request.flush([entry]);
  });

  it('maps the backend empty-list 404 response to an empty array', () => {
    service.list().subscribe((entries) => expect(entries).toEqual([]));
    http.expectOne(`${environment.apiBaseUrl}/journal`).flush(null, { status: 404, statusText: 'Not Found' });
  });

  it('uses the existing id route for update and delete', () => {
    service.update(entry.id, { title: 'Changed', content: 'Updated' }).subscribe();
    const update = http.expectOne(`${environment.apiBaseUrl}/journal/id/${entry.id}`);
    expect(update.request.method).toBe('PUT');
    update.flush(null);

    service.delete(entry.id).subscribe();
    const deletion = http.expectOne(`${environment.apiBaseUrl}/journal/id/${entry.id}`);
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null);
  });
});
