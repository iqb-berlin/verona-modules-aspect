import { VeronaAPIService, StartCommand } from 'editor/src/app/services/verona-api.service';

describe('VeronaAPIService', () => {
  let service: VeronaAPIService;

  const dispatchMessage = (data: Record<string, unknown>): void => {
    window.dispatchEvent(new MessageEvent('message', { data }));
  };

  /* Replaces window.parent for the test, so the standalone guard
     (window === window.parent) behaves the same in every test runner. */
  const mockParentWindow = (): { postMessage: ReturnType<typeof vi.fn> } => {
    const parentWindowMock = { postMessage: vi.fn() };
    vi.spyOn(window, 'parent', 'get').mockReturnValue(parentWindowMock as unknown as Window);
    return parentWindowMock;
  };

  beforeEach(() => {
    service = new VeronaAPIService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should store session data from a voeStartCommand message and emit the command', () => {
    const receivedCommands: StartCommand[] = [];
    service.startCommand.subscribe(command => {
      receivedCommands.push(command);
    });

    dispatchMessage({
      type: 'voeStartCommand',
      sessionId: 'session-1',
      editorConfig: { directDownloadUrl: 'https://example.test/resources', role: 'developer' }
    });

    expect(service.sessionID).toBe('session-1');
    expect(service.getResourceURL()).toBe('https://example.test/resources');
    expect(receivedCommands.length).toBe(1);
    expect(receivedCommands[0].sessionId).toBe('session-1');
  });

  it('should ignore messages of other types', () => {
    dispatchMessage({ type: 'vopStateChangedNotification', sessionId: 'other-session' });

    expect(service.sessionID).toBeUndefined();
  });

  it('should fall back to the local assets folder when no resource URL is set', () => {
    expect(service.getResourceURL()).toBe('assets');
  });

  it('should post a voeReadyNotification with empty metadata to the host', () => {
    const parentWindowMock = mockParentWindow();

    service.sendReady();

    expect(parentWindowMock.postMessage).toHaveBeenCalledWith(
      { type: 'voeReadyNotification', metadata: {} },
      '*'
    );
  });

  it('should post a voeDefinitionChangedNotification with the unit definition to the host', () => {
    const parentWindowMock = mockParentWindow();
    service.sessionID = 'session-1';

    service.sendChanged('unit-def', 'aspect-unit-definition', []);

    expect(parentWindowMock.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'voeDefinitionChangedNotification',
        sessionId: 'session-1',
        unitDefinition: 'unit-def',
        unitDefinitionType: 'aspect-unit-definition',
        variables: []
      }),
      '*'
    );
  });

  it('should not post messages in standalone mode', () => {
    vi.spyOn(window, 'parent', 'get').mockReturnValue(window);
    const postMessageSpy = vi.spyOn(window, 'postMessage').mockImplementation(() => {});

    service.sendReady();

    expect(postMessageSpy).not.toHaveBeenCalled();
  });
});
