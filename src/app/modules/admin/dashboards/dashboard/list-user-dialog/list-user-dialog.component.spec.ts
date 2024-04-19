import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListUserDialogComponent } from './list-user-dialog.component';

describe('ListUserDialogComponent', () => {
  let component: ListUserDialogComponent;
  let fixture: ComponentFixture<ListUserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListUserDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
