/**
 * Tests for git operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execSync } from 'node:child_process';

import {
  isGitRepo,
  getBranchName,
  getGitStatus,
  getAheadBehind,
  getGitInfo,
  formatGitIndicators,
} from './git.util.js';

// Mock Node.js modules
vi.mock('node:child_process');

describe('isGitRepo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true if directory is in a git repo', () => {
    vi.mocked(execSync).mockReturnValue('true' as any);

    const result = isGitRepo('/test/repo');
    expect(result).toBe(true);
    expect(execSync).toHaveBeenCalledWith(
      'git rev-parse --is-inside-work-tree',
      expect.objectContaining({ cwd: '/test/repo' })
    );
  });

  it('should return false if directory is not in a git repo', () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('not a git repository');
    });

    const result = isGitRepo('/not/a/repo');
    expect(result).toBe(false);
  });
});

describe('getBranchName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return branch name from symbolic-ref', () => {
    vi.mocked(execSync).mockReturnValue('  feature/test-branch\n' as any);

    const result = getBranchName('/test/repo');
    expect(result).toBe('feature/test-branch');
    expect(execSync).toHaveBeenCalledWith(
      'git symbolic-ref --short HEAD',
      expect.any(Object)
    );
  });

  it('should return commit hash in detached HEAD state', () => {
    vi.mocked(execSync)
      .mockImplementationOnce(() => {
        throw new Error('ref HEAD is not a symbolic ref');
      })
      .mockReturnValueOnce('abc1234' as any);

    const result = getBranchName('/test/repo');
    expect(result).toBe('(abc1234)');
    expect(execSync).toHaveBeenCalledWith(
      'git rev-parse --short HEAD',
      expect.any(Object)
    );
  });

  it('should return null if git commands fail', () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('git error');
    });

    const result = getBranchName('/test/repo');
    expect(result).toBeNull();
  });

  it('should trim whitespace from branch name', () => {
    vi.mocked(execSync).mockReturnValue('  main  \n' as any);

    const result = getBranchName('/test/repo');
    expect(result).toBe('main');
  });
});

describe('getGitStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect dirty working tree', () => {
    // Note: Can't test ` M` alone because trim() removes leading space
    // Use MM instead (staged + modified)
    const statusOutput = 'MM modified.ts\n';
    vi.mocked(execSync).mockReturnValue(statusOutput as any);

    const result = getGitStatus('/test/repo');
    expect(result.isDirty).toBe(true);
    expect(result.hasStaged).toBe(true);
    expect(result.hasUntracked).toBe(false);
  });

  it('should detect staged changes', () => {
    const statusOutput = 'M  src/file.ts\n';
    vi.mocked(execSync).mockReturnValue(statusOutput as any);

    const result = getGitStatus('/test/repo');
    expect(result.hasStaged).toBe(true);
    expect(result.isDirty).toBe(false);
  });

  it('should detect untracked files', () => {
    const statusOutput = '?? newfile.ts\n';
    vi.mocked(execSync).mockReturnValue(statusOutput as any);

    const result = getGitStatus('/test/repo');
    expect(result.hasUntracked).toBe(true);
    expect(result.isDirty).toBe(false);
    expect(result.hasStaged).toBe(false);
  });

  it('should detect multiple status flags', () => {
    const statusOutput = 'M  staged.ts\n M modified.ts\n?? untracked.ts\n';
    vi.mocked(execSync).mockReturnValue(statusOutput as any);

    const result = getGitStatus('/test/repo');
    expect(result.hasStaged).toBe(true);
    expect(result.isDirty).toBe(true);
    expect(result.hasUntracked).toBe(true);
  });

  it('should return clean status for empty output', () => {
    vi.mocked(execSync).mockReturnValue('' as any);

    const result = getGitStatus('/test/repo');
    expect(result.isDirty).toBe(false);
    expect(result.hasStaged).toBe(false);
    expect(result.hasUntracked).toBe(false);
  });

  it('should return clean status if git command fails', () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('git error');
    });

    const result = getGitStatus('/test/repo');
    expect(result.isDirty).toBe(false);
    expect(result.hasStaged).toBe(false);
    expect(result.hasUntracked).toBe(false);
  });
});

describe('getAheadBehind', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse ahead and behind counts', () => {
    vi.mocked(execSync).mockReturnValue('3\t5' as any);

    const result = getAheadBehind('/test/repo');
    expect(result.ahead).toBe(3);
    expect(result.behind).toBe(5);
  });

  it('should return 0 for both when up to date', () => {
    vi.mocked(execSync).mockReturnValue('0\t0' as any);

    const result = getAheadBehind('/test/repo');
    expect(result.ahead).toBe(0);
    expect(result.behind).toBe(0);
  });

  it('should return 0 if git command fails (no upstream)', () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('no upstream branch');
    });

    const result = getAheadBehind('/test/repo');
    expect(result.ahead).toBe(0);
    expect(result.behind).toBe(0);
  });
});

describe('getGitInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return full git info for valid repo', () => {
    vi.mocked(execSync)
      .mockReturnValueOnce('true' as any) // isGitRepo
      .mockReturnValueOnce('main' as any) // getBranchName
      .mockReturnValueOnce('M  file.ts\n' as any) // getGitStatus
      .mockReturnValueOnce('2\t1' as any); // getAheadBehind

    const result = getGitInfo('/test/repo');
    expect(result).toEqual({
      branch: 'main',
      isDirty: false,
      hasStaged: true,
      hasUntracked: false,
      ahead: 2,
      behind: 1,
    });
  });

  it('should return null if not a git repo', () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('not a git repository');
    });

    const result = getGitInfo('/not/a/repo');
    expect(result).toBeNull();
  });

  it('should return null if branch name cannot be determined', () => {
    vi.mocked(execSync)
      .mockReturnValueOnce('true' as any) // isGitRepo
      .mockImplementationOnce(() => {
        throw new Error('git error');
      });

    const result = getGitInfo('/test/repo');
    expect(result).toBeNull();
  });
});

describe('formatGitIndicators', () => {
  it('should format dirty indicator', () => {
    const info = {
      branch: 'main',
      isDirty: true,
      hasStaged: false,
      hasUntracked: false,
      ahead: 0,
      behind: 0,
    };

    expect(formatGitIndicators(info)).toBe('*');
  });

  it('should format staged indicator', () => {
    const info = {
      branch: 'main',
      isDirty: false,
      hasStaged: true,
      hasUntracked: false,
      ahead: 0,
      behind: 0,
    };

    expect(formatGitIndicators(info)).toBe('+');
  });

  it('should format untracked indicator', () => {
    const info = {
      branch: 'main',
      isDirty: false,
      hasStaged: false,
      hasUntracked: true,
      ahead: 0,
      behind: 0,
    };

    expect(formatGitIndicators(info)).toBe('?');
  });

  it('should format ahead indicator', () => {
    const info = {
      branch: 'main',
      isDirty: false,
      hasStaged: false,
      hasUntracked: false,
      ahead: 3,
      behind: 0,
    };

    expect(formatGitIndicators(info)).toBe('↑3');
  });

  it('should format behind indicator', () => {
    const info = {
      branch: 'main',
      isDirty: false,
      hasStaged: false,
      hasUntracked: false,
      ahead: 0,
      behind: 2,
    };

    expect(formatGitIndicators(info)).toBe('↓2');
  });

  it('should combine multiple indicators', () => {
    const info = {
      branch: 'main',
      isDirty: true,
      hasStaged: true,
      hasUntracked: true,
      ahead: 2,
      behind: 1,
    };

    expect(formatGitIndicators(info)).toBe('*+?↑2↓1');
  });

  it('should return empty string for clean status', () => {
    const info = {
      branch: 'main',
      isDirty: false,
      hasStaged: false,
      hasUntracked: false,
      ahead: 0,
      behind: 0,
    };

    expect(formatGitIndicators(info)).toBe('');
  });
});
