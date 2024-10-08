import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkableWordComponent } from './markable-word.component';

describe('MarkableWordComponent', () => {
  let component: MarkableWordComponent;
  let fixture: ComponentFixture<MarkableWordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkableWordComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MarkableWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
