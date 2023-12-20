import { TestBed } from '@angular/core/testing';

import { DashboardTabService } from './dashboard-tab.service';

describe('DashboardTabService', () => {
  let service: DashboardTabService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardTabService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
