"use client";

import { useEffect } from 'react';

import { appLogger } from '@/lib/logger';

export function BootstrapLogger(): null {
  useEffect(() => {
    const logger = appLogger.withScope('bootstrap');

    logger.info('Frontend shell mounted');
    logger.debug('Bootstrap logger initialized', { stage: 'milestone-1' });
    logger.success('Logging middleware is wired into the app');
  }, []);

  return null;
}
