import { TestBed } from '@angular/core/testing';

import { InterationService } from './interation.service';

describe('InterationService', () => {
  let service: InterationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
