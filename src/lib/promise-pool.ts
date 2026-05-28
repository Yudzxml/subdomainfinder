export interface PromisePoolOptions {
  concurrency: number;
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
  onProgress?: (completed: number, total: number) => void;
}

export interface PromisePoolResult<T> {
  success: T[];
  failed: { item: any; error: Error }[];
  total: number;
  duration: number;
}

export class PromisePool<T, R = any> {
  private options: Required<PromisePoolOptions>;
  private queue: Array<{
    item: T;
    fn: (item: T) => Promise<R>;
    resolve: (value: R) => void;
    reject: (error: Error) => void;
    retries: number;
  }> = [];
  private active = 0;
  private completed = 0;
  private startTime = 0;

  constructor(options: PromisePoolOptions) {
    this.options = {
      concurrency: options.concurrency,
      retryAttempts: options.retryAttempts || 3,
      retryDelay: options.retryDelay || 1000,
      timeout: options.timeout || 30000,
      onProgress: options.onProgress || (() => {}),
    };
  }

  async add(item: T, fn: (item: T) => Promise<R>): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        item,
        fn,
        resolve,
        reject,
        retries: 0,
      });

      this.process();
    });
  }

  private async process() {
    if (this.active >= this.options.concurrency || this.queue.length === 0) {
      return;
    }

    this.active++;
    const task = this.queue.shift()!;

    try {
      const result = await this.executeWithRetry(task);
      task.resolve(result);
    } catch (error) {
      task.reject(error as Error);
    } finally {
      this.active--;
      this.completed++;
      this.options.onProgress(this.completed, this.queue.length + this.completed);
      this.process();
    }
  }

  private async executeWithRetry(task: {
    item: T;
    fn: (item: T) => Promise<R>;
    retries: number;
  }): Promise<R> {
    const { item, fn, retries } = task;

    try {
      return await this.withTimeout(fn(item), this.options.timeout);
    } catch (error) {
      if (retries < this.options.retryAttempts) {
        // Exponential backoff
        const delay = this.options.retryDelay * Math.pow(2, retries);
        await new Promise((resolve) => setTimeout(resolve, delay));

        task.retries++;
        return this.executeWithRetry(task);
      }
      throw error;
    }
  }

  private withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeout)
      ),
    ]);
  }

  getStats() {
    return {
      active: this.active,
      queued: this.queue.length,
      completed: this.completed,
    };
  }
}

export async function executeInParallel<T, R>(
  items: T[],
  executor: (item: T, index: number) => Promise<R>,
  options: Partial<PromisePoolOptions> = {}
): Promise<PromisePoolResult<R>> {
  const startTime = Date.now();

  const poolOptions: Required<PromisePoolOptions> = {
    concurrency: options.concurrency || 10,
    retryAttempts: options.retryAttempts || 3,
    retryDelay: options.retryDelay || 1000,
    timeout: options.timeout || 30000,
    onProgress: options.onProgress || (() => {}),
  };

  const pool = new PromisePool<T, R>(poolOptions);

  const promises = items.map((item, index) =>
    pool.add(item, (i) => executor(i, index))
  );

  const results = await Promise.allSettled(promises);

  const success: R[] = [];
  const failed: { item: T; error: Error }[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      success.push(result.value);
    } else {
      failed.push({ item: items[index], error: result.reason });
    }
  });

  const duration = Date.now() - startTime;

  return {
    success,
    failed,
    total: items.length,
    duration,
  };
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}