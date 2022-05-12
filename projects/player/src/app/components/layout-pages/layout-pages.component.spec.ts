import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutPagesComponent } from './layout-pages.component';
import { Subject } from 'rxjs';
import { FlexModule } from '@angular/flex-layout';

describe('LayoutPlayerComponent', () => {
  let component: LayoutPagesComponent;
  let fixture: ComponentFixture<LayoutPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayoutPagesComponent ],
      imports: [ FlexModule ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutPagesComponent);
    component = fixture.componentInstance;
    component.selectIndex = new Subject<number>();
    component.scrollPages = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
