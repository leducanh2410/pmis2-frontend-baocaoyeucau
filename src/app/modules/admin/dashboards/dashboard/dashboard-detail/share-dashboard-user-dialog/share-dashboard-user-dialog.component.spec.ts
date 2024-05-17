import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareDashboardUserDialogComponent } from './share-dashboard-user-dialog.component';

describe('ShareDashboardUserDialogComponent', () => {
  let component: ShareDashboardUserDialogComponent;
  let fixture: ComponentFixture<ShareDashboardUserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareDashboardUserDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareDashboardUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
