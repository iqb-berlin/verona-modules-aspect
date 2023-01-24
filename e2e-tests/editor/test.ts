import Page from './page-model';

fixture `Button Tests`
  .page `../../dist/iqb-editor-aspect.html`;

const page = new Page();

test('Button existence', async t => {
  await t
    .expect(page.newButtonElement.exists).ok()
    .expect(page.newInvalidElemnt.exists).notOk();
});

test('Add button to canvas', async t => {
  const canvasElementButton = Page.getCanvasElementSelector('aspect-button');

  await t
    .click(page.newButtonElement)
    .expect(canvasElementButton.exists).ok();
});

test('Change button label', async t => {
  const canvasElementButton = Page.getCanvasElementSelector('aspect-button');

  await t
    .click(page.newButtonElement)
    .expect(canvasElementButton.exists).ok()
    .expect(page.labelPropertyField.exists).ok()
    .typeText(page.labelPropertyField, 'TestBeschriftung', { replace: true })
    .expect(canvasElementButton.withExactText('TestBeschriftung').exists).ok();
});
