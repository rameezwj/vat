import { TestBed } from '@angular/core/testing';

import { NotificationService } from './notification.service';

describe('NotificationServiceService', () => {
  let service: NotificationServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
