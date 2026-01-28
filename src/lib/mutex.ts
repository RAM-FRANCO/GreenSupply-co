import fs from 'node:fs';
import path from 'node:path';

/**
 * A simple file-based mutex using directory creation (atomic operation).
 * Used to preventing race conditions during file-based DB writes.
 */
export class FileMutex {
    private readonly lockDir: string;
    private readonly maxRetries: number;
    private readonly retryDelayMs: number;
    private readonly staleTimeoutMs: number;

    constructor(lockName: string, options: { maxRetries?: number; retryDelayMs?: number; staleTimeoutMs?: number } = {}) {
        this.lockDir = path.join(process.cwd(), 'data', `${lockName}.lock`);
        this.maxRetries = options.maxRetries ?? 20; // Default: try for ~2 seconds (100ms * 20)
        this.retryDelayMs = options.retryDelayMs ?? 100;
        this.staleTimeoutMs = options.staleTimeoutMs ?? 5000; // 5 seconds max lock time
    }

    /**
     * Acquire the lock.
     * Internal method.
     */
    private async acquire(): Promise<void> {
        for (let i = 0; i < this.maxRetries; i++) {
            try {
                fs.mkdirSync(this.lockDir);
                return; // Lock acquired
            } catch (err: unknown) {
                if ((err as { code?: string }).code !== 'EEXIST') {
                    throw err; // Unexpected error
                }

                // Lock exists. Check if it's stale.
                if (this.isStale()) {
                    this.release(); // Force release stale lock
                    continue; // Retry immediately
                }

                // Wait and retry
                await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs));
            }
        }
        throw new Error(`Failed to acquire lock for ${this.lockDir} after ${this.maxRetries} attempts`);
    }

    /**
     * Release the lock.
     */
    private release(): void {
        try {
            fs.rmdirSync(this.lockDir);
        } catch (err: unknown) {
            if ((err as { code?: string }).code !== 'ENOENT') {
                console.warn(`Failed to release lock ${this.lockDir}:`, err);
            }
        }
    }

    /**
     * Check if the lock is stale (older than timeout).
     */
    private isStale(): boolean {
        try {
            const stats = fs.statSync(this.lockDir);
            const now = Date.now();
            return now - stats.mtimeMs > this.staleTimeoutMs;
        } catch {
            return false; // Valid case if lock was removed in between
        }
    }

    /**
     * Run a task exclusively.
     */
    async runExclusive<T>(task: () => Promise<T> | T): Promise<T> {
        await this.acquire();
        try {
            const result = await task();
            return result;
        } finally {
            this.release();
        }
    }
}

export const stockMutex = new FileMutex('stock_transaction');
