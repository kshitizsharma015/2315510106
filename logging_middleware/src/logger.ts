export type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error';

export type LogContext = Record<string, unknown>;

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  scope: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LogSink {
  write(entry: LogEntry): void;
}

export interface Logger {
  debug(message: string, context?: LogContext): LogEntry;
  info(message: string, context?: LogContext): LogEntry;
  success(message: string, context?: LogContext): LogEntry;
  warn(message: string, context?: LogContext): LogEntry;
  error(message: string, error?: unknown, context?: LogContext): LogEntry;
  getHistory(): LogEntry[];
  clearHistory(): void;
  withScope(scope: string): Logger;
}

interface LoggerOptions {
  scope?: string;
  sink?: LogSink;
}

const LOG_EVENT_NAME = 'campus-notifications:log';

class MemorySink implements LogSink {
  private readonly entries: LogEntry[] = [];

  write(entry: LogEntry): void {
    this.entries.push(entry);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent<LogEntry>(LOG_EVENT_NAME, { detail: entry }));
    }
  }

  getEntries(): LogEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries.length = 0;
  }
}

export function createMemorySink(): MemorySink {
  return new MemorySink();
}

function createId(): string {
  const cryptoId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : '';

  if (cryptoId) {
    return cryptoId;
  }

  return `log_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function normalizeError(error: unknown): LogEntry['error'] | undefined {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (typeof error === 'string') {
    return {
      name: 'Error',
      message: error,
    };
  }

  if (error && typeof error === 'object') {
    return {
      name: 'Error',
      message: 'Unknown error object',
      stack: JSON.stringify(error),
    };
  }

  return undefined;
}

function createEntry(scope: string, level: LogLevel, message: string, context?: LogContext, error?: unknown): LogEntry {
  return {
    id: createId(),
    level,
    message,
    timestamp: new Date().toISOString(),
    scope,
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
    ...(error !== undefined ? { error: normalizeError(error) } : {}),
  };
}

function createLoggerInternal(scope: string, sink: LogSink): Logger {
  const write = (level: LogLevel, message: string, context?: LogContext, error?: unknown): LogEntry => {
    const entry = createEntry(scope, level, message, context, error);
    sink.write(entry);
    return entry;
  };

  return {
    debug(message, context) {
      return write('debug', message, context);
    },
    info(message, context) {
      return write('info', message, context);
    },
    success(message, context) {
      return write('success', message, context);
    },
    warn(message, context) {
      return write('warn', message, context);
    },
    error(message, error, context) {
      return write('error', message, context, error);
    },
    getHistory() {
      if (sink instanceof MemorySink) {
        return sink.getEntries();
      }

      return [];
    },
    clearHistory() {
      if (sink instanceof MemorySink) {
        sink.clear();
      }
    },
    withScope(nextScope) {
      return createLoggerInternal(nextScope, sink);
    },
  };
}

const defaultSink = createMemorySink();

export function createLogger(options: LoggerOptions = {}): Logger {
  return createLoggerInternal(options.scope ?? 'app', options.sink ?? defaultSink);
}

export function getLogger(scope?: string): Logger {
  return createLogger({ scope });
}

export const logger = createLogger({ scope: 'campus-notifications' });
