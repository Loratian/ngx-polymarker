import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxPolymarkerComponent } from './ngx-polymarker.component';

describe('NgxPolymarkerComponent', () => {
  let component: NgxPolymarkerComponent;
  let fixture: ComponentFixture<NgxPolymarkerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NgxPolymarkerComponent]
    });
    fixture = TestBed.createComponent(NgxPolymarkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
