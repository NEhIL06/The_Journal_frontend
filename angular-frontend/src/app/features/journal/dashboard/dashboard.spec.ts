import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { JournalService } from '../../../core/services/journal.service';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;
  const journals = { list: vi.fn(), greeting: vi.fn(), delete: vi.fn() };
  const auth = { getUserName: () => 'writer', logout: vi.fn() };

  beforeEach(async () => {
    journals.list.mockReturnValue(of([]));
    journals.greeting.mockReturnValue(of('Hi writer'));
    journals.delete.mockReturnValue(of(undefined));
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: JournalService, useValue: journals },
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Dashboard);
  });

  it('shows a useful empty state', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state')?.textContent).toContain('Your first page is waiting');
  });

  it('renders entries returned by the service', () => {
    journals.list.mockReturnValue(of([{ id: '1', title: 'A good day', content: 'Sunshine', date: '2026-09-05T10:00:00', sentiment: 'HAPPY' }]));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.journal-card h2')?.textContent).toContain('A good day');
    expect(fixture.nativeElement.querySelector('.sentiment-pill')?.textContent).toContain('happy');
  });
});
