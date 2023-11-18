import { TestBed } from '@angular/core/testing';

import { NgxPolymarkerService } from './ngx-polymarker.service';

describe('NgxPolymarkerService', () => {
  let service: NgxPolymarkerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxPolymarkerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
