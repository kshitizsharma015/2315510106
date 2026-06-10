import { createLogger } from '@campus/logging-middleware';

export const appLogger = createLogger({ scope: 'notification_app_fe' });
