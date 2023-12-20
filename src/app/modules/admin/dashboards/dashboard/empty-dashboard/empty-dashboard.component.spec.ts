import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyDashboardComponent } from './empty-dashboard.component';

describe('EmptyDashboardComponent', () => {
  let component: EmptyDashboardComponent;
  let fixture: ComponentFixture<EmptyDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmptyDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptyDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
