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

  /* The editor API requires only the session id; the config may be missing (#1623). */
  it('should take a voeStartCommand without editorConfig', () => {
    const receivedCommands: StartCommand[] = [];
    service.startCommand.subscribe(command => {
      receivedCommands.push(command);
    });

    dispatchMessage({ type: 'voeStartCommand', sessionId: 'session-1' });

    expect(receivedCommands.length).toBe(1);
    expect(service.getResourceURL()).toBe('assets');
  });

  it('should ignore messages of other types', () => {
    dispatchMessage({ type: 'vopStateChangedNotification', sessionId: 'other-session' });

    expect(service.sessionID).toBeUndefined();
  });

  it('should fall back to the local assets folder when no resource URL is set', () => {
    expect(service.getResourceURL()).toBe('assets');
  });

  it('should post a voeReadyNotification with the text of an empty object when there is no metadata block', () => {
    const parentWindowMock = mockParentWindow();

    service.sendReady();

    expect(parentWindowMock.postMessage).toHaveBeenCalledWith(
      { type: 'voeReadyNotification', metadata: '{}' },
      '*'
    );
  });

  /* The editor API wants the metadata as text; an object is what a studio before 22.0.0 read (#1623). */
  it('should post the metadata block as text, not as the object it describes', () => {
    const parentWindowMock = mockParentWindow();
    const block = document.createElement('script');
    block.id = 'verona-metadata';
    block.type = 'application/ld+json';
    block.textContent = '{ "specVersion": "5.0" }';
    document.body.appendChild(block);

    try {
      service.sendReady();
    } finally {
      block.remove();
    }

    expect(parentWindowMock.postMessage).toHaveBeenCalledWith(
      { type: 'voeReadyNotification', metadata: '{ "specVersion": "5.0" }' },
      '*'
    );
  });

  it('should post a voeDefinitionChangedNotification with the unit definition and its dependencies to the host', () => {
    const parentWindowMock = mockParentWindow();
    service.sessionID = 'session-1';

    service.sendChanged('unit-def', 'aspect-unit-definition', [], {
      dependenciesToPlay: [{ id: 'PERIODIC_TABLE', type: 'WIDGET' }],
      dependenciesToEdit: []
    });

    expect(parentWindowMock.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'voeDefinitionChangedNotification',
        sessionId: 'session-1',
        // the editor API declares the time stamp as `date-time`
        timeStamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/),
        unitDefinition: 'unit-def',
        unitDefinitionType: 'aspect-unit-definition',
        variables: [],
        dependenciesToPlay: [{ id: 'PERIODIC_TABLE', type: 'WIDGET' }],
        dependenciesToEdit: []
      }),
      '*'
    );
  });

  /* The editor API makes `variables` optional, and studio keeps its stored list only when the key is absent
     -- an empty list would be stored as one (#1129). */
  it('should leave out the variables when no list is given', () => {
    const parentWindowMock = mockParentWindow();

    const noDependencies = { dependenciesToPlay: [], dependenciesToEdit: [] };
    service.sendChanged('unit-def', 'aspect-unit-definition', undefined, noDependencies);

    const message = parentWindowMock.postMessage.mock.lastCall?.[0];
    expect(message.unitDefinition).toBe('unit-def');
    expect('variables' in message).toBe(false);
  });

  it('should not post messages in standalone mode', () => {
    vi.spyOn(window, 'parent', 'get').mockReturnValue(window);
    const postMessageSpy = vi.spyOn(window, 'postMessage').mockImplementation(() => {});

    service.sendReady();

    expect(postMessageSpy).not.toHaveBeenCalled();
  });
});
