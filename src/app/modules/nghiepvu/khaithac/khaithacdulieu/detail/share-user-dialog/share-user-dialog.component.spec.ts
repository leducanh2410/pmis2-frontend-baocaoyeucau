import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareUserDialogComponent } from './share-user-dialog.component';

describe('ShareUserDialogComponent', () => {
  let component: ShareUserDialogComponent;
  let fixture: ComponentFixture<ShareUserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareUserDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
