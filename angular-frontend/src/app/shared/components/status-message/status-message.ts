import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-message',
  standalone: true,
  templateUrl: './status-message.html',
})
export class StatusMessage {
  @Input({ required: true }) message = '';
  @Input() type: 'error' | 'success' | 'info' = 'info';
}
