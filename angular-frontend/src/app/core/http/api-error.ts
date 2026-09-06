import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorResponse } from '../models/auth.models';

const DEFAULT_MESSAGES: Record<number, string> = {
  0: 'Unable to reach the server. Check your connection and try again.',
  400: 'Please check the information you entered.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested item could not be found.',
  409: 'That information is already in use.',
  500: 'The server encountered an error. Please try again.',
};

export function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Something went wrong. Please try again.';
  }

  if (typeof error.error === 'string' && error.error.trim()) {
    return error.error.trim();
  }

  const body = error.error as Partial<ApiErrorResponse> | null;
  return body?.message || DEFAULT_MESSAGES[error.status] || 'The request could not be completed.';
}
