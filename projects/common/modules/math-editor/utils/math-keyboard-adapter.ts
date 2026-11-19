import {
  initVirtualKeyboardInCurrentBrowsingContext,
  MathfieldElement,
  VirtualKeyboardInterface
} from 'mathlive';

/** Members the MathLive keyboard has at runtime but leaves out of its public type. */
export type MathKeyboardRuntime = VirtualKeyboardInterface & EventTarget & {
  shiftPressCount: 0 | 1 | 2;
  currentLayer: string;
};

/**
 * What aspect needs of MathLive's formula keyboard and the unchanged library does not do by itself.
 * Until #1648 a fork of MathLive (`@iqb/mathlive`) did all of this by changing the library.
 *
 * Three of the members -- `open`, `onPointerDown` and `onMouseUp` -- rest on MathLive internals: the
 * untyped `shiftPressCount` and `currentLayer`, the classes of the keyboard's markup and the window
 * listener that resets Shift. That is why `mathlive` is pinned to an exact version in package.json;
 * the spec runs against the real keyboard and fails when an update moves one of them.
 */
export class MathKeyboardAdapter {
  private static readonly KEYBOARD = '.ML__keyboard';
  private static readonly LAYER_TAB = '.ML__keyboard [data-layer]';

  /** The pointer type of the last pointerdown in the keyboard, which is what tells a tap's mouseup from
      a mouse's. */
  private static lastPointerType = '';

  private static readonly silent = (): void => undefined;

  static get keyboard(): MathKeyboardRuntime {
    return window.mathVirtualKeyboard as MathKeyboardRuntime;
  }

  /**
   * Settings for every math field and the keyboard of this page. Has to run before the first read of
   * `window.mathVirtualKeyboard`, so it is called at the end of this file, when the module is loaded:
   * whoever reads the keyboard through this class finds it configured.
   */
  static configure(): void {
    MathKeyboardAdapter.discardKeyboardProxy(window);
    // The player runs in an iFrame, and the keyboard has to live in that iFrame, not in the top window.
    initVirtualKeyboardInCurrentBrowsingContext();
    // The packed player has no sound files and brings its own fonts (mathlive-fonts.css).
    MathfieldElement.soundsDirectory = null;
    MathfieldElement.fontsDirectory = null;
    /* Without sound files MathLive still vibrates on every key press on devices that can. The setting of
       the same name on the keyboard (mathVirtualKeyboard.keypressVibration) has no effect. */
    MathfieldElement.keypressVibration = false;
    /* Alt+Ctrl+Up/Down would read the formula aloud; nothing is to be read to a test taker. The
       announcements for screen readers do not go through these hooks and stay on. */
    MathfieldElement.speakHook = MathKeyboardAdapter.silent;
    MathfieldElement.readAloudHook = MathKeyboardAdapter.silent;
  }

  /**
   * In an iFrame, MathLive puts a configurable getter on window that creates a proxy on first read, and
   * the proxy posts to `window.top` at once -- which throws under an opaque origin (a sandboxed
   * iFrame). The init function reads that getter itself, so it is replaced by a plain value first.
   * In the top window the property is not configurable, and nothing is done.
   */
  static discardKeyboardProxy(target: object): void {
    if (Object.getOwnPropertyDescriptor(target, 'mathVirtualKeyboard')?.configurable) {
      Object.defineProperty(target, 'mathVirtualKeyboard', { value: undefined, configurable: true, writable: true });
    }
  }

  /** Whether `target` is the keyboard or something in it, a key for instance. */
  static contains(target: EventTarget | null): boolean {
    return target instanceof Element && !!target.closest(MathKeyboardAdapter.KEYBOARD);
  }

  /**
   * Registers the two window listeners. They are static and held, so any number of math inputs
   * registers them exactly once (#1123). There is no teardown, deliberately: they belong to the
   * page-wide keyboard, not to one component, and the first math input destroyed would otherwise take
   * them away from every one still on the page.
   */
  static listen(): void {
    window.addEventListener('pointerdown', MathKeyboardAdapter.onPointerDown, { capture: true });
    window.addEventListener('mouseup', MathKeyboardAdapter.onMouseUp, { capture: true });
  }

  /**
   * Shows the keyboard; when it was closed, on its first layer and without Shift. Only then: on the
   * iPad every key tap sends the focus back into the field (#1600), and a reset on each of those would
   * undo a tapped Shift before the next key.
   */
  static open(): void {
    const keyboard = MathKeyboardAdapter.keyboard;
    if (!keyboard.visible) {
      // While hidden the keyboard only stores the layer, and an empty one makes show() pick the first.
      keyboard.currentLayer = '';
      keyboard.shiftPressCount = 0;
    }
    keyboard.show();
  }

  /**
   * Resets Shift when a layer tab is pressed, which MathLive has no event for. Checked on pointerdown,
   * because MathLive captures a mouse pointer and the pointerup then no longer arrives at the tab. Only
   * for the primary button, the one MathLive changes the layer on.
   */
  private static readonly onPointerDown = (event: PointerEvent): void => {
    if (!MathKeyboardAdapter.contains(event.target)) return;
    MathKeyboardAdapter.lastPointerType = event.pointerType;
    if (event.button === 0 && (event.target as Element).closest(MathKeyboardAdapter.LAYER_TAB)) {
      MathKeyboardAdapter.keyboard.shiftPressCount = 0;
    }
  };

  /**
   * Safari on iOS sends a mouseup after a tap even when the pointerdown was default-prevented, and
   * MathLive resets Shift on every mouseup at window -- so a tapped Shift was gone before the next key
   * (#1607). Stopped here, in the capture phase at window, the mouseup never reaches MathLive's listener.
   */
  private static readonly onMouseUp = (event: MouseEvent): void => {
    if ((MathKeyboardAdapter.lastPointerType === 'touch' || MathKeyboardAdapter.lastPointerType === 'pen') &&
      MathKeyboardAdapter.contains(event.target)) {
      event.stopPropagation();
    }
  };
}

MathKeyboardAdapter.configure();
