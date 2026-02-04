/**
 * Tests for configuration server
 *
 * SECURITY FOCUS: Directory traversal prevention testing
 */

import { exec } from 'node:child_process';
import { createSocket } from 'node:dgram';
import { EventEmitter } from 'node:events';
import { readFileSync, existsSync, watch } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Node.js modules BEFORE importing server.service.js
vi.mock('node:child_process');
vi.mock('node:dgram');
vi.mock('node:fs');

// Import after mocking
import {
  isPortAvailable,
  findAvailablePort,
  openBrowser,
  serveStaticFile,
  handleSseConnection,
  notifyReload,
  handleRequest,
  setupFileWatcher,
} from './server.service.js';

describe('isPortAvailable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true if port is available', async () => {
    const mockSocket = new EventEmitter() as ReturnType<typeof createSocket>;
    mockSocket.bind = vi.fn();
    mockSocket.close = vi.fn();

    vi.mocked(createSocket).mockReturnValue(mockSocket);

    const promise = isPortAvailable(8765);

    // Simulate successful bind
    process.nextTick(() => mockSocket.emit('listening'));

    const result = await promise;
    expect(result).toBe(true);
    expect(mockSocket.close).toHaveBeenCalled();
  });

  it('should return false if port is in use', async () => {
    const mockSocket = new EventEmitter() as ReturnType<typeof createSocket>;
    mockSocket.bind = vi.fn();
    mockSocket.close = vi.fn();

    vi.mocked(createSocket).mockReturnValue(mockSocket);

    const promise = isPortAvailable(8765);

    // Simulate port already in use
    process.nextTick(() => mockSocket.emit('error', new Error('EADDRINUSE')));

    const result = await promise;
    expect(result).toBe(false);
    expect(mockSocket.close).toHaveBeenCalled();
  });
});

describe('findAvailablePort', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return first available port', async () => {
    const mockSocket = new EventEmitter() as ReturnType<typeof createSocket>;
    mockSocket.bind = vi.fn();
    mockSocket.close = vi.fn();

    vi.mocked(createSocket).mockReturnValue(mockSocket);

    const promise = findAvailablePort(8765);

    // Simulate port available
    process.nextTick(() => mockSocket.emit('listening'));

    const result = await promise;
    expect(result).toBe(8765);
  });

  it('should try next port if first is unavailable', async () => {
    let callCount = 0;
    const mockSocket = new EventEmitter() as ReturnType<typeof createSocket>;
    mockSocket.bind = vi.fn();
    mockSocket.close = vi.fn();

    vi.mocked(createSocket).mockImplementation(() => {
      const socket = new EventEmitter() as ReturnType<typeof createSocket>;
      socket.bind = vi.fn();
      socket.close = vi.fn();

      // First call fails, second succeeds
      process.nextTick(() => {
        if (callCount === 0) {
          socket.emit('error', new Error('EADDRINUSE'));
        } else {
          socket.emit('listening');
        }
        callCount++;
      });

      return socket;
    });

    const result = await findAvailablePort(8765);
    expect(result).toBeGreaterThanOrEqual(8765);
  });

  it('should throw error if no port available in range', async () => {
    vi.mocked(createSocket).mockImplementation(() => {
      const socket = new EventEmitter() as ReturnType<typeof createSocket>;
      socket.bind = vi.fn();
      socket.close = vi.fn();

      // Always fail
      process.nextTick(() => {
        socket.emit('error', new Error('EADDRINUSE'));
      });

      return socket;
    });

    await expect(findAvailablePort(8765)).rejects.toThrow('No available port found');
  });
});

describe('openBrowser', () => {
  let originalPlatform: string;

  beforeEach(() => {
    vi.clearAllMocks();
    originalPlatform = process.platform;
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: originalPlatform,
      configurable: true,
    });
  });

  it('should use "open" command on macOS', () => {
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(exec).mockImplementation((() => {}) as any);

    openBrowser('http://localhost:8765');

    expect(exec).toHaveBeenCalledWith(
      'open "http://localhost:8765"',
      expect.any(Function)
    );
  });

  it('should use "start" command on Windows', () => {
    Object.defineProperty(process, 'platform', {
      value: 'win32',
      configurable: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(exec).mockImplementation((() => {}) as any);

    openBrowser('http://localhost:8765');

    expect(exec).toHaveBeenCalledWith(
      'start "" "http://localhost:8765"',
      expect.any(Function)
    );
  });

  it('should use "xdg-open" command on Linux', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(exec).mockImplementation((() => {}) as any);

    openBrowser('http://localhost:8765');

    expect(exec).toHaveBeenCalledWith(
      'xdg-open "http://localhost:8765"',
      expect.any(Function)
    );
  });

  it('should log error message if browser command fails', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(exec).mockImplementation(((cmd: string, callback: any) => {
      callback(new Error('Command failed'));
    }) as any);

    openBrowser('http://localhost:8765');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('Could not open browser')
    );

    consoleLogSpy.mockRestore();
  });
});

describe('serveStaticFile - SECURITY TESTS', () => {
  let mockRes: Partial<ServerResponse>;
  let responseStatus: number;
  let responseHeaders: Record<string, string>;

  beforeEach(() => {
    vi.clearAllMocks();
    responseStatus = 200;
    responseHeaders = {};

    mockRes = {
      writeHead: vi.fn((status: number, headers?: Record<string, string>) => {
        responseStatus = status;
        if (headers) responseHeaders = headers;
        return mockRes as ServerResponse;
      }),
      end: vi.fn(() => {
        return mockRes as ServerResponse;
      }),
    } as Partial<ServerResponse>;
  });

  it('should serve valid file', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(Buffer.from('<html>test</html>'));

    const result = serveStaticFile(mockRes as ServerResponse, '/path/to/gui/index.html');

    expect(result).toBe(true);
    expect(responseStatus).toBe(200);
    expect(responseHeaders['Content-Type']).toBe('text/html');
  });

  it('should return false if file does not exist', () => {
    vi.mocked(existsSync).mockReturnValue(false);

    const result = serveStaticFile(mockRes as ServerResponse, '/path/to/nonexistent.html');

    expect(result).toBe(false);
  });

  it('should return false if file read fails', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('Permission denied');
    });

    const result = serveStaticFile(mockRes as ServerResponse, '/path/to/file.html');

    expect(result).toBe(false);
  });

  it('should serve HTML files with correct MIME type', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(Buffer.from('<html></html>'));

    serveStaticFile(mockRes as ServerResponse, '/path/index.html');

    expect(responseHeaders['Content-Type']).toBe('text/html');
  });

  it('should serve JavaScript files with correct MIME type', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(Buffer.from('console.log("test")'));

    serveStaticFile(mockRes as ServerResponse, '/path/main.js');

    expect(responseHeaders['Content-Type']).toBe('application/javascript');
  });

  it('should serve CSS files with correct MIME type', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(Buffer.from('body { margin: 0; }'));

    serveStaticFile(mockRes as ServerResponse, '/path/styles.css');

    expect(responseHeaders['Content-Type']).toBe('text/css');
  });

  it('should serve unknown file types as octet-stream', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(Buffer.from('binary data'));

    serveStaticFile(mockRes as ServerResponse, '/path/file.bin');

    expect(responseHeaders['Content-Type']).toBe('application/octet-stream');
  });
});

describe('handleRequest - Directory Traversal Prevention (CRITICAL SECURITY)', () => {
  let mockReq: Partial<IncomingMessage>;
  let mockRes: Partial<ServerResponse>;
  let responseStatus: number;
  let responseData: string;

  beforeEach(() => {
    vi.clearAllMocks();
    responseStatus = 200;
    responseData = '';

    mockReq = {
      url: '/',
      method: 'GET',
    } as Partial<IncomingMessage>;

    mockRes = {
      writeHead: vi.fn((status: number) => {
        responseStatus = status;
        return mockRes as ServerResponse;
      }),
      write: vi.fn(),
      end: vi.fn((data?: string) => {
        if (data) responseData = data;
        return mockRes as ServerResponse;
      }),
      on: vi.fn(),
    } as Partial<ServerResponse>;
  });

  const maliciousPaths = [
    { path: '../../../etc/passwd', description: 'Unix parent directory traversal' },
    { path: '..\\..\\..\\windows\\system32', description: 'Windows parent directory traversal' },
    { path: '....//....//etc/passwd', description: 'Double dot traversal' },
    { path: '/etc/passwd', description: 'Absolute Unix path' },
    { path: 'C:\\Windows\\System32\\config', description: 'Windows absolute path' },
    { path: '/../../../etc/passwd', description: 'Leading slash with traversal' },
    { path: 'gui/../../package.json', description: 'Relative escape from GUI dir' },
    { path: 'gui/../../../.env', description: 'Environment file access attempt' },
    { path: './../../../.git/config', description: 'Git config access attempt' },
    { path: '../../node_modules', description: 'Node modules access attempt' },
    { path: '../src/utils/oauth.util.ts', description: 'Source code access attempt' },
    { path: '%2e%2e%2f%2e%2e%2fetc%2fpasswd', description: 'URL encoded traversal' },
    { path: '..%2f..%2f..%2fetc%2fpasswd', description: 'Mixed encoding traversal' },
    { path: '.../.../.../', description: 'Triple dot traversal' },
    { path: '././../../etc/passwd', description: 'Current dir + traversal combo' },
    { path: 'gui//../../etc/passwd', description: 'Double slash traversal' },
    { path: 'gui\\..\\..\\etc\\passwd', description: 'Backslash traversal' },
    { path: '\0../../../etc/passwd', description: 'Null byte injection' },
    { path: '../../../etc/shadow', description: 'Shadow file access attempt' },
    { path: '../../../root/.ssh/id_rsa', description: 'SSH key access attempt' },
    { path: '../../.credentials.json', description: 'Credentials file access attempt' },
    { path: 'gui/../../secrets.txt', description: 'Arbitrary file access' },
  ];

  maliciousPaths.forEach(({ path, description }) => {
    it(`should block: ${description} (${path})`, async () => {
      mockReq.url = path;
      vi.mocked(existsSync).mockReturnValue(false);

      await handleRequest(mockReq as IncomingMessage, mockRes as ServerResponse);

      // Should return 403 Forbidden OR 404 Not Found (both are safe)
      // 403 = explicitly blocked, 404 = path doesn't escape + doesn't exist
      expect([403, 404]).toContain(responseStatus);
      if (responseStatus === 403) {
        expect(responseData).toBe('Forbidden');
      }
    });
  });

  it('should allow access to valid GUI files', async () => {
    mockReq.url = '/main.js';
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(Buffer.from('console.log("test")'));

    await handleRequest(mockReq as IncomingMessage, mockRes as ServerResponse);

    expect(responseStatus).toBe(200);
  });

  it('should allow access to nested GUI files', async () => {
    mockReq.url = '/modules/editor.js';
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(Buffer.from('// module'));

    await handleRequest(mockReq as IncomingMessage, mockRes as ServerResponse);

    expect(responseStatus).toBe(200);
  });

  it('should serve index.html for root path', async () => {
    mockReq.url = '/';
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(Buffer.from('<html></html>'));

    await handleRequest(mockReq as IncomingMessage, mockRes as ServerResponse);

    expect(responseStatus).toBe(200);
  });

  it('should return 404 if file not found and no fallback', async () => {
    mockReq.url = '/missing.js';
    vi.mocked(existsSync).mockReturnValue(false);

    await handleRequest(mockReq as IncomingMessage, mockRes as ServerResponse);

    expect(responseStatus).toBe(404);
    expect(responseData).toBe('Not found');
  });
});

describe('handleSseConnection', () => {
  let mockRes: Partial<ServerResponse>;
  let responseStatus: number;
  let responseHeaders: Record<string, string>;
  let writtenData: string[];

  beforeEach(() => {
    vi.clearAllMocks();
    responseStatus = 200;
    responseHeaders = {};
    writtenData = [];

    mockRes = {
      writeHead: vi.fn((status: number, headers?: Record<string, string>) => {
        responseStatus = status;
        if (headers) responseHeaders = headers;
        return mockRes as ServerResponse;
      }),
      write: vi.fn((data: string) => {
        writtenData.push(data);
        return true;
      }),
      on: vi.fn(),
    } as Partial<ServerResponse>;
  });

  it('should set correct SSE headers', () => {
    handleSseConnection(mockRes as ServerResponse);

    expect(responseStatus).toBe(200);
    expect(responseHeaders['Content-Type']).toBe('text/event-stream');
    expect(responseHeaders['Cache-Control']).toBe('no-cache');
    expect(responseHeaders['Connection']).toBe('keep-alive');
    expect(responseHeaders['Access-Control-Allow-Origin']).toBe('*');
  });

  it('should send initial connection message', () => {
    handleSseConnection(mockRes as ServerResponse);

    expect(writtenData).toContain('data: connected\n\n');
  });

  it('should register close handler', () => {
    handleSseConnection(mockRes as ServerResponse);

    expect(mockRes.on).toHaveBeenCalledWith('close', expect.any(Function));
  });
});

describe('notifyReload', () => {
  it('should send reload message to all connected clients', () => {
    const mockClient1 = {
      writeHead: vi.fn().mockReturnThis(),
      write: vi.fn(),
      on: vi.fn(),
    };
    const mockClient2 = {
      writeHead: vi.fn().mockReturnThis(),
      write: vi.fn(),
      on: vi.fn(),
    };

    // Connect clients
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleSseConnection(mockClient1 as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleSseConnection(mockClient2 as any);

    // Notify
    notifyReload();

    expect(mockClient1.write).toHaveBeenCalledWith('data: reload\n\n');
    expect(mockClient2.write).toHaveBeenCalledWith('data: reload\n\n');
  });
});

describe('setupFileWatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not setup watcher if GUI dir does not exist', () => {
    vi.mocked(existsSync).mockReturnValue(false);

    setupFileWatcher();

    expect(watch).not.toHaveBeenCalled();
  });

  it('should setup watcher if GUI dir exists', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(watch).mockReturnValue(undefined as any);

    setupFileWatcher();

    expect(watch).toHaveBeenCalledWith(
      expect.stringContaining('gui'),
      { recursive: true },
      expect.any(Function)
    );
  });

  it('should watch for HTML/JS/CSS file changes', async () => {
    vi.mocked(existsSync).mockReturnValue(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let watchCallback: any;
    vi.mocked(watch).mockImplementation((path, options, callback) => {
      watchCallback = callback;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return undefined as any;
    });

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    vi.useFakeTimers();
    setupFileWatcher();

    // Simulate HTML file change
    watchCallback('change', 'index.html');

    // Wait for debounce (100ms + margin)
    await vi.advanceTimersByTimeAsync(150);
    vi.useRealTimers();

    // Should log the file change
    expect(consoleLogSpy).toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });

  it('should ignore non-relevant file changes', async () => {
    vi.mocked(existsSync).mockReturnValue(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let watchCallback: any;
    vi.mocked(watch).mockImplementation((path, options, callback) => {
      watchCallback = callback;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return undefined as any;
    });

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    vi.useFakeTimers();
    setupFileWatcher();

    // Simulate txt file change (ignored)
    watchCallback('change', 'test.txt');

    // Wait for debounce
    await vi.advanceTimersByTimeAsync(150);
    vi.useRealTimers();

    // Should NOT log anything (file type ignored)
    expect(consoleLogSpy).not.toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });
});
