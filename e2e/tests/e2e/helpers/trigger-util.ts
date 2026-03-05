import {addTextElement, selectFromDropdown, setCheckbox} from "../../util";

export function addTextExample(modus: string,
                               settings?: Record<string, boolean>){
  addTextElement("Absatz 1: Do elit aliqua lorem eiusmod. " +
    "Dolore sed magna labore ipsum aliqua tempor do labore elit dolor elit eiusmod.\n\n" +
    "Absatz 2: Ipsum aliqua lorem tempor labore eiusmod lorem do magna do" +
    " elit consectetur do dolor.\n\n" +
    "Absatz 3: Iolore sed magna labore ipsum aliqua tempor.");
  // Color options
  if (settings?.highlightableOrange) setCheckbox('Orange');
  if (settings?.highlightableTurquoise) setCheckbox('Türkis');
  if (settings?.highlightableYellow) setCheckbox('Gelb');
  if (settings?.hasSelectionPopup) setCheckbox('Farbauswahl-Popup');

  selectFromDropdown('Markierungsmodus', modus);
}
