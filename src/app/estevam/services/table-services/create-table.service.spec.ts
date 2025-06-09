import { TestBed } from '@angular/core/testing';

import { CreateTableService } from './create-table.service';

describe('CreateTableService', () => {
  let service: CreateTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
