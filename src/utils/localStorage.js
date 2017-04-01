import config from '../config';

const keys = {
    LOG_GROUP: 'logs-loggroup'
};


export function currentLogGroup() {
    const existingEntry = window.localStorage.getItem(keys.LOG_GROUP)
    if (existingEntry) {
        return existingEntry;
    }
    return config.DEFAULT_LOG_GROUP;
}