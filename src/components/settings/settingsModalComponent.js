import React, { Component } from 'react';
import { Settings, currentSettings, saveSettings } from '../../utils/localStorage';

const modalId = 'primary-settings-modal';


class SettingsModal extends Component {    
    constructor(props) {
        super(props);
        const settings = currentSettings();
        
        this.state = {
            logGroup: settings.logGroup
        };

        this.updateProperty = this.updateProperty.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
    }
    
    componentDidMount() {
        window.$(`#${modalId}`).modal();
    }

    updateProperty(property) {
        return (evt) => {
            const newPropObject = {};
            newPropObject[property] = evt.target.value;

            const newState = Object.assign({}, this.state, newPropObject);
            this.setState(newState);
        };
    }

    saveSettings() {
        saveSettings(new Settings(this.state.logGroup));
    }
    
    render() {
        return (
            <div id={modalId} className="modal modal-fixed-footer">
                <div className="modal-content">
                    <h4>Settings</h4>
                    <section className="settings-section">
                        <div className="log-group-name-setting">
                            Log group:
                            <div className="input-field inline">
                                <input id="log-group-input" type="text" className="validate" 
                                    value={this.state.logGroup}
                                    onChange={this.updateProperty('logGroup')} />
                                <label htmlFor="log-group-input">log group name</label>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="modal-footer">
                    <button className="waves-effect modal-close waves-green btn" onClick={this.saveSettings}>Save</button>
                    <button className="modal-action modal-close waves-effect waves-green btn-flat">Close</button>
                </div>
            </div>
        );
    }
}

export default SettingsModal;