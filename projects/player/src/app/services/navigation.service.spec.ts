import { TestBed } from '@angular/core/testing';
import { NavigationService } from './navigation.service';

describe('NavigationService', () => {
  let service: NavigationService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('pageIndex should be 2', done => {
    service.pageIndex
      .subscribe( pageIndex => {
        expect(pageIndex).toEqual(2);
        done();
      });
    service.setPage(2);
  });

  it('pageIndex should not be 2', done => {
    service.pageIndex
      .subscribe( pageIndex => {
        expect(pageIndex).not.toEqual(2);
        done();
      });
    service.setPage(1);
  });
});
