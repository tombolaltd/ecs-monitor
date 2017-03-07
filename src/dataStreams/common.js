import logger from '../utils/logger';

export function streamRetryFn(delay) {
    return (errors$) => {
        errors$.subscribe(logger.logToConsole);
        return errors$.delay(delay);
    };
}