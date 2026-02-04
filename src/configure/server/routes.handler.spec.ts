/**
 * Integration tests for REST API route handlers
 */

import { EventEmitter } from 'node:events';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { Settings } from '../../types/index.js';
import * as configUtil from '../../utils/index.js';

import {
  handleGetSettings,
  handlePutSettings,
  handleGetWidgets,
  handlePostPreview,
} from './routes.handler.js';

// Mock utilities
vi.mock('../../utils/config.util.js');
vi.mock('../../widgets/index.js', () => ({
  getAllSchemas: () => [
    {
      id: 'directory',
      meta: { displayName: 'Directory', description: 'Current directory', category: 'location' },
      options: { content: { color: 'blue' } },
      previewStates: [],
    },
  ],
}));

describe('API Route Handlers', () => {
  let mockReq: Partial<IncomingMessage>;
  let mockRes: Partial<ServerResponse>;
  let responseData: string;
  let responseStatus: number;
  let responseHeaders: Record<string, string>;

  beforeEach(() => {
    vi.clearAllMocks();
    responseData = '';
    responseStatus = 200;
    responseHeaders = {};

    mockReq = new EventEmitter() as Partial<IncomingMessage>;
    mockRes = {
      writeHead: vi.fn((status: number, headers?: Record<string, string>) => {
        responseStatus = status;
        if (headers) responseHeaders = headers;
      }),
      end: vi.fn((data: string) => {
        responseData = data;
      }),
    } as Partial<ServerResponse>;
  });

  describe('GET /api/settings', () => {
    it('should return current settings as JSON', async () => {
      const mockSettings: Settings = {
        rows: [[{ widget: 'directory' }]],
        cacheTtl: 60000,
      };
      vi.mocked(configUtil.loadSettings).mockReturnValue(mockSettings);

      await handleGetSettings(mockReq as IncomingMessage, mockRes as ServerResponse);

      expect(responseStatus).toBe(200);
      expect(responseHeaders['Content-Type']).toBe('application/json');

      const parsed = JSON.parse(responseData);
      expect(parsed.success).toBe(true);
      expect(parsed.data).toEqual(mockSettings);
    });

    it('should return 500 if loading fails', async () => {
      vi.mocked(configUtil.loadSettings).mockImplementation(() => {
        throw new Error('Load error');
      });

      await handleGetSettings(mockReq as IncomingMessage, mockRes as ServerResponse);

      expect(responseStatus).toBe(500);
      const parsed = JSON.parse(responseData);
      expect(parsed.success).toBe(false);
      expect(parsed.error).toBe('Failed to load settings');
    });
  });

  describe('PUT /api/settings', () => {
    it.skip('should save settings and return updated data', async () => {
      const newSettings: Settings = {
        rows: [[{ widget: 'model' }]],
        cacheTtl: 120000,
      };

      // Simulate request body with promise
      const handlePromise = handlePutSettings(mockReq as IncomingMessage, mockRes as ServerResponse);

      // Emit data after starting handler
      process.nextTick(() => {
        mockReq.emit?.('data', JSON.stringify(newSettings));
        mockReq.emit?.('end');
      });

      await handlePromise;

      expect(configUtil.saveSettings).toHaveBeenCalledWith(newSettings);
      expect(responseStatus).toBe(200);

      const parsed = JSON.parse(responseData);
      expect(parsed.success).toBe(true);
      expect(parsed.data).toEqual(newSettings);
    });

    it('should return 500 for invalid JSON', async () => {
      const handlePromise = handlePutSettings(mockReq as IncomingMessage, mockRes as ServerResponse);

      process.nextTick(() => {
        mockReq.emit?.('data', 'invalid-json');
        mockReq.emit?.('end');
      });

      await handlePromise;

      expect(responseStatus).toBe(500);
      const parsed = JSON.parse(responseData);
      expect(parsed.success).toBe(false);
      expect(parsed.error).toBe('Invalid JSON body');
    });

    it('should return 500 if save fails', async () => {
      vi.mocked(configUtil.saveSettings).mockImplementation(() => {
        throw new Error('Save error');
      });

      const settings: Settings = { rows: [[{ widget: 'directory' }]], cacheTtl: 60000 };

      const handlePromise = handlePutSettings(mockReq as IncomingMessage, mockRes as ServerResponse);

      process.nextTick(() => {
        mockReq.emit?.('data', JSON.stringify(settings));
        mockReq.emit?.('end');
      });

      await handlePromise;

      expect(responseStatus).toBe(500);
      const parsed = JSON.parse(responseData);
      expect(parsed.success).toBe(false);
    });
  });

  describe('GET /api/widgets', () => {
    it('should return widget schemas and metadata', async () => {
      await handleGetWidgets(mockReq as IncomingMessage, mockRes as ServerResponse);

      expect(responseStatus).toBe(200);
      expect(responseHeaders['Content-Type']).toBe('application/json');

      const parsed = JSON.parse(responseData);
      expect(parsed.success).toBe(true);
      expect(parsed.data).toHaveProperty('widgets');
      expect(parsed.data).toHaveProperty('categories');
      expect(parsed.data).toHaveProperty('themes');
      expect(parsed.data).toHaveProperty('widgetSchemas');

      expect(Array.isArray(parsed.data.widgets)).toBe(true);
      expect(parsed.data.widgets[0]).toHaveProperty('id');
      expect(parsed.data.widgets[0]).toHaveProperty('name');
      expect(parsed.data.widgets[0]).toHaveProperty('category');
    });

    it('should include terminal themes and palettes', async () => {
      await handleGetWidgets(mockReq as IncomingMessage, mockRes as ServerResponse);

      const parsed = JSON.parse(responseData);
      expect(Array.isArray(parsed.data.themes)).toBe(true);
      expect(Array.isArray(parsed.data.terminalPalettes)).toBe(true);
    });
  });

  describe('POST /api/preview', () => {
    it.skip('should generate preview HTML', async () => {
      const previewRequest = {
        settings: { rows: [[{ widget: 'directory' }]], cacheTtl: 60000 },
        terminalWidth: 80,
        widgetStates: {},
        terminalPalette: 'dracula',
      };

      const handlePromise = handlePostPreview(mockReq as IncomingMessage, mockRes as ServerResponse);

      process.nextTick(() => {
        mockReq.emit?.('data', JSON.stringify(previewRequest));
        mockReq.emit?.('end');
      });

      await handlePromise;

      expect(responseStatus).toBe(200);
      const parsed = JSON.parse(responseData);
      expect(parsed.success).toBe(true);
      expect(parsed.data).toHaveProperty('htmlRows');
      expect(Array.isArray(parsed.data.htmlRows)).toBe(true);
    });

    it('should return 500 for invalid preview request', async () => {
      const handlePromise = handlePostPreview(mockReq as IncomingMessage, mockRes as ServerResponse);

      process.nextTick(() => {
        mockReq.emit?.('data', 'invalid-json');
        mockReq.emit?.('end');
      });

      await handlePromise;

      expect(responseStatus).toBe(500);
      const parsed = JSON.parse(responseData);
      expect(parsed.success).toBe(false);
    });
  });
});
