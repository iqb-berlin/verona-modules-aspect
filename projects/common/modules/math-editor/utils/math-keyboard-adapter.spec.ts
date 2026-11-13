import { MathfieldElement } from 'mathlive';
import { MathKeyboardAdapter, MathKeyboardRuntime } from './math-keyboard-adapter';

/* Run against the real MathLive keyboard, not a stand-in: half of what the adapter does rests on
   MathLive internals, and these tests are what notices when an update of the library moves them. */
describe('MathKeyboardAdapter', () => {
  let keyboard: MathKeyboardRuntime;

  const pointerDown = (target: Element, pointerType: string, button = 0): void => {
    target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType, button }));
  };

  const mouseUp = (target: Element): void => {
    target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  };

  const layerTab = (): Element => document.querySelector('.ML__keyboard [data-layer]') as Element;

  const keycap = (): Element => document.querySelector('.ML__keyboard .MLK__keycap') as Element;

  const layerIds = (): string[] => Array.from(document.querySelectorAll('.ML__keyboard .MLK__layer'))
    .map(layer => layer.id);

  beforeAll(() => {
    MathKeyboardAdapter.listen();
    keyboard = MathKeyboardAdapter.keyboard;
  });

  afterEach(() => {
    keyboard.hide();
    keyboard.shiftPressCount = 0;
    vi.restoreAllMocks();
  });

  describe('configure', () => {
    /* Not called by this spec: loading the module is what configures, so that nobody can read the
       keyboard through the adapter before. The tests run in an iFrame, where an unconfigured read
       yields MathLive's proxy to the top window. */
    it('should have put the keyboard itself on window on load, not the proxy to the top window', () => {
      // Only the keyboard itself counts Shift presses; the proxy has no such member.
      expect(keyboard.shiftPressCount).toBe(0);
      expect(keyboard.currentLayer).toBe('');
    });

    it('should switch off sounds, font loading and vibration', () => {
      MathfieldElement.soundsDirectory = './sounds';
      MathfieldElement.fontsDirectory = './fonts';
      MathfieldElement.keypressVibration = true;
      MathKeyboardAdapter.configure();
      expect(MathfieldElement.soundsDirectory).toBeNull();
      expect(MathfieldElement.fontsDirectory).toBeNull();
      expect(MathfieldElement.keypressVibration).toBe(false);
    });

    it('should read nothing aloud', () => {
      const speakHook = vi.fn();
      const readAloudHook = vi.fn();
      MathfieldElement.speakHook = speakHook;
      MathfieldElement.readAloudHook = readAloudHook;
      MathKeyboardAdapter.configure();
      const mathField = document.body.appendChild(new MathfieldElement());
      mathField.setValue('a+b');
      mathField.executeCommand(['speak', 'all', { withHighlighting: false }]);
      mathField.executeCommand(['speak', 'all', { withHighlighting: true }]);
      mathField.remove();
      expect(speakHook).not.toHaveBeenCalled();
      expect(readAloudHook).not.toHaveBeenCalled();
      expect(MathfieldElement.speakHook).toBe(MathfieldElement.readAloudHook);
    });

    it('should be harmless when called again', () => {
      MathKeyboardAdapter.configure();
      expect(window.mathVirtualKeyboard).toBe(keyboard);
    });
  });

  describe('discardKeyboardProxy', () => {
    it('should replace a configurable getter without reading it', () => {
      const getter = vi.fn(() => { throw new Error('posts to window.top'); });
      const target = Object.defineProperty({}, 'mathVirtualKeyboard', { get: getter, configurable: true });
      MathKeyboardAdapter.discardKeyboardProxy(target);
      expect((target as { mathVirtualKeyboard?: unknown }).mathVirtualKeyboard).toBeUndefined();
      expect(getter).not.toHaveBeenCalled();
    });

    it('should leave a keyboard that is already mounted where it is', () => {
      const mounted = {};
      const target = Object.defineProperty({}, 'mathVirtualKeyboard', { get: () => mounted });
      MathKeyboardAdapter.discardKeyboardProxy(target);
      expect((target as { mathVirtualKeyboard?: unknown }).mathVirtualKeyboard).toBe(mounted);
    });
  });

  describe('contains', () => {
    it('should know the keyboard and its keys, and nothing else', () => {
      MathKeyboardAdapter.open();
      expect(MathKeyboardAdapter.contains(keycap())).toBe(true);
      expect(MathKeyboardAdapter.contains(document.querySelector('.ML__keyboard'))).toBe(true);
      expect(MathKeyboardAdapter.contains(document.body)).toBe(false);
      expect(MathKeyboardAdapter.contains(window)).toBe(false);
      expect(MathKeyboardAdapter.contains(null)).toBe(false);
    });
  });

  describe('open', () => {
    it('should show the keyboard', () => {
      MathKeyboardAdapter.open();
      expect(keyboard.visible).toBe(true);
    });

    it('should reset Shift when the keyboard was closed', () => {
      keyboard.shiftPressCount = 2;
      MathKeyboardAdapter.open();
      expect(keyboard.shiftPressCount).toBe(0);
    });

    it('should start on the first layer when the keyboard was closed', () => {
      MathKeyboardAdapter.open();
      const [firstLayer, secondLayer] = layerIds();
      keyboard.currentLayer = secondLayer;
      expect(keyboard.currentLayer).toBe(secondLayer);
      keyboard.hide();
      MathKeyboardAdapter.open();
      expect(keyboard.currentLayer).toBe(firstLayer);
    });

    /* On the iPad the focus comes back into the field after every key tap (#1600). */
    it('should keep Shift and the layer while the keyboard is open', () => {
      MathKeyboardAdapter.open();
      const secondLayer = layerIds()[1];
      keyboard.currentLayer = secondLayer;
      keyboard.shiftPressCount = 1;
      MathKeyboardAdapter.open();
      expect(keyboard.shiftPressCount).toBe(1);
      expect(keyboard.currentLayer).toBe(secondLayer);
    });
  });

  describe('listen', () => {
    it('should register the same listeners however often it is called (#1123)', () => {
      const addEventListener = vi.spyOn(window, 'addEventListener');
      MathKeyboardAdapter.listen();
      MathKeyboardAdapter.listen();
      const listeners = (type: string): unknown[] => addEventListener.mock.calls
        .filter(call => call[0] === type)
        .map(call => call[1]);
      expect(listeners('pointerdown').length).toBe(2);
      expect(new Set(listeners('pointerdown')).size).toBe(1);
      expect(listeners('mouseup').length).toBe(2);
      expect(new Set(listeners('mouseup')).size).toBe(1);
    });

    it('should reset Shift when a layer tab is pressed', () => {
      MathKeyboardAdapter.open();
      keyboard.shiftPressCount = 2;
      pointerDown(layerTab(), 'mouse');
      expect(keyboard.shiftPressCount).toBe(0);
    });

    /* MathLive changes the layer on the primary button only. */
    it('should leave Shift alone when a layer tab is pressed with another button', () => {
      MathKeyboardAdapter.open();
      keyboard.shiftPressCount = 2;
      pointerDown(layerTab(), 'mouse', 2);
      expect(keyboard.shiftPressCount).toBe(2);
    });

    it('should go by the pointer that pressed in the keyboard, not by one elsewhere on the page', () => {
      MathKeyboardAdapter.open();
      pointerDown(keycap(), 'mouse');
      pointerDown(document.body, 'touch');
      keyboard.shiftPressCount = 1;
      mouseUp(keycap());
      expect(keyboard.shiftPressCount).toBe(0);
    });

    it('should leave Shift alone when something else in the keyboard is pressed', () => {
      MathKeyboardAdapter.open();
      keyboard.shiftPressCount = 2;
      pointerDown(document.querySelector('.ML__keyboard') as Element, 'mouse');
      expect(keyboard.shiftPressCount).toBe(2);
    });

    /* Safari on iOS sends a mouseup after every tap, and MathLive resets Shift on a mouseup (#1607). */
    it('should keep a tapped Shift through the mouseup that follows the tap', () => {
      MathKeyboardAdapter.open();
      pointerDown(keycap(), 'touch');
      keyboard.shiftPressCount = 1;
      mouseUp(keycap());
      expect(keyboard.shiftPressCount).toBe(1);
    });

    it('should keep a Shift tapped with a pen as well', () => {
      MathKeyboardAdapter.open();
      pointerDown(keycap(), 'pen');
      keyboard.shiftPressCount = 1;
      mouseUp(keycap());
      expect(keyboard.shiftPressCount).toBe(1);
    });

    /* The counterpart: this is MathLive's own behaviour, which the adapter leaves to a mouse. If it
       fails, MathLive no longer resets Shift on mouseup, and onMouseUp has nothing left to prevent. */
    it('should let MathLive reset Shift on the mouseup of a mouse', () => {
      MathKeyboardAdapter.open();
      pointerDown(keycap(), 'mouse');
      keyboard.shiftPressCount = 1;
      mouseUp(keycap());
      expect(keyboard.shiftPressCount).toBe(0);
    });

    it('should not stop a mouseup outside the keyboard after a tap', () => {
      const onMouseUp = vi.fn();
      window.addEventListener('mouseup', onMouseUp);
      MathKeyboardAdapter.open();
      pointerDown(keycap(), 'touch');
      mouseUp(document.body);
      window.removeEventListener('mouseup', onMouseUp);
      expect(onMouseUp).toHaveBeenCalledTimes(1);
    });
  });
});
