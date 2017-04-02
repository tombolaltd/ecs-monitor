import React, { Component, PropTypes } from 'react';

const modalId = 'primary-settings-modal';

class SettingsModal extends Component {    
    componentDidMount() {
        window.$(`#${modalId}`).modal();
    }
    
    render() {
        return (
            <div id={modalId} className="modal modal-fixed-footer">
                <div className="modal-content">
                    <h4>Settings</h4>
                    <p>settings here...</p>
                </div>
                <div className="modal-footer">
                    <a href="#!" className="modal-action modal-close waves-effect waves-green btn-flat">Save and Close</a>
                </div>
            </div>
        );
    }
}

export default SettingsModal;