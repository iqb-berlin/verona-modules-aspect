import {
  Component, ElementRef, EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UnitPageSection } from '../../../../../common/unit';
import { FormService } from '../../../../../common/form.service';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html'
})
export class SectionComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Input() section!: UnitPageSection;
  @Input() parentArrayIndex!: number;
  @Input() lastSection!: boolean;
  @Output() pagePresented = new EventEmitter<number>();
  @Input() pagesContainer!: HTMLElement;

  sectionForm!: FormGroup;
  intersectionObserver!: IntersectionObserver;

  constructor(private formService: FormService,
              private formBuilder: FormBuilder,
              private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this.sectionForm = new FormGroup({
      elements: this.formBuilder.array([])
    });
    this.formService.registerFormGroup({
      formGroup: this.sectionForm,
      parentForm: this.parentForm,
      parentArray: 'sections',
      parentArrayIndex: this.parentArrayIndex
    });
    if (this.lastSection) {
      this.initIntersectionObserver();
    }
  }

  initIntersectionObserver(): void {
    this.intersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.pagePresented.emit(this.parentArrayIndex);
        }
      }), {
        root: this.pagesContainer,
        rootMargin: '-90% 0px -10% 0px'
      }
    );
    this.intersectionObserver.observe(this.elementRef.nativeElement);
  }
}
