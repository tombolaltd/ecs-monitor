import config from '../config';

const keys = {
    SETTINGS: 'settings'
};

export class Settings {
    constructor(logGroup) {
        this.logGroup = logGroup;
    }
}

export function currentLogGroup() {
    return currentSettings().logGroup;
}

export function currentSettings() {
    const existingSettings = window.localStorage.getItem(keys.SETTINGS);
    if (existingSettings) {
        return JSON.parse(existingSettings);
    }

    saveSettings(config.DEFAULT_SETTINGS);
    return config.DEFAULT_SETTINGS;
}

export function saveSettings(settings) {
    window.localStorage.setItem(keys.SETTINGS, JSON.stringify(settings));
}