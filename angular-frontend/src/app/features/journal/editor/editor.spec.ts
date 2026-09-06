import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { JournalService } from '../../../core/services/journal.service';
import { JournalEditor } from './editor';

describe('JournalEditor', () => {
  let fixture: ComponentFixture<JournalEditor>;
  const journals = { create: vi.fn(), get: vi.fn(), update: vi.fn() };
  const auth = { getUserName: () => 'writer', logout: vi.fn() };

  beforeEach(async () => {
    journals.create.mockReset();
    journals.get.mockReset();
    journals.update.mockReset();
    await TestBed.configureTestingModule({
      imports: [JournalEditor],
      providers: [
        provideRouter([]),
        { provide: JournalService, useValue: journals },
        { provide: AuthService, useValue: auth },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { mode: 'create' }, paramMap: convertToParamMap({}) } },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(JournalEditor);
    fixture.detectChanges();
  });

  it('shows validation feedback and does not save an empty entry', () => {
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(journals.create).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('.field-error').length).toBe(2);
  });

  it('trims and creates a journal entry through the service', () => {
    journals.create.mockReturnValue(of({}));
    fixture.componentInstance.form.setValue({ title: ' A calm morning ', content: ' Tea and rain. ' });

    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(journals.create).toHaveBeenCalledWith({ title: 'A calm morning', content: 'Tea and rain.' });
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain('entry has been saved');
  });
});
