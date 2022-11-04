import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyboardKeyComponent } from './keyboard-key.component';

describe('KeyboardKeyComponent', () => {
  let component: KeyboardKeyComponent;
  let fixture: ComponentFixture<KeyboardKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [KeyboardKeyComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyboardKeyComponent);
    component = fixture.componentInstance;
    component.key = 'a';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
