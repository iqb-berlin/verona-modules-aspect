import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageComponent } from './page.component';

describe('PageComponent', () => {
  let component: PageComponent;
  let fixture: ComponentFixture<PageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageComponent ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageComponent);
    component = fixture.componentInstance;
    component.page = {
      sections: [],
      hasMaxWidth: false,
      maxWidth: 0,
      margin: 0,
      backgroundColor: 'white',
      alwaysVisible: false,
      alwaysVisiblePagePosition: 'left',
      alwaysVisibleAspectRatio: 50
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
