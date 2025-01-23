import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkableDelimiterComponent } from './markable-delimiter.component';

describe('MarkableDelimiterComponent', () => {
  let component: MarkableDelimiterComponent;
  let fixture: ComponentFixture<MarkableDelimiterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkableDelimiterComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(MarkableDelimiterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
