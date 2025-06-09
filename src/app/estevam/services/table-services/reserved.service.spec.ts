import { TestBed } from '@angular/core/testing';

import { ReservedService } from './reserved.service';

describe('ReservedService', () => {
  let service: ReservedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
