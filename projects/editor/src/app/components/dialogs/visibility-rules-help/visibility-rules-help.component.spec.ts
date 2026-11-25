import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { VisibilityRulesHelpComponent } from './visibility-rules-help.component';

describe('VisibilityRulesHelpComponent', () => {
  let fixture: ComponentFixture<VisibilityRulesHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisibilityRulesHelpComponent],
      imports: [TranslateModule.forRoot()]
    }).compileComponents();
    fixture = TestBed.createComponent(VisibilityRulesHelpComponent);
    fixture.detectChanges();
  });

  const cellsOfRow = (kind: string): string[] => {
    const row = Array.from(fixture.nativeElement.querySelectorAll('tbody tr') as NodeListOf<HTMLElement>)
      .find(tableRow => tableRow.textContent?.includes(`visibilityRule.help.kind.${kind}.elements`));
    return Array.from(row?.querySelectorAll('td') || [])
      .map(cell => (cell.textContent || '').replace(/\s+/g, ' ').trim());
  };

  it('should list the comparisons a kind of answer is offered, as the dialog offers them (#1718)', () => {
    expect(cellsOfRow('option')[3]).toBe('=, ≠, <, ≤, >, ≥');
    expect(cellsOfRow('text')[3]).toBe('visibilityRule.help.allOperators');
    expect(cellsOfRow('marking')[3]).toBe('visibilityRule.help.none');
  });

  it('should say where only a change can be asked (#1718)', () => {
    expect(cellsOfRow('changedOnly')[2]).toBe('visibilityRule.help.onlyChanged');
    expect(cellsOfRow('checkbox')[2]).toBe('visibilityRule.help.kind.checkbox.answered');
  });
});
