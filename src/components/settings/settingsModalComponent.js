import React, { Component, PropTypes } from 'react';


class SettingsModal extends Component {
    render() {
        return (
            <div id={this.props.modalId} className="modal modal-fixed-footer">
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


SettingsModal.propTypes = {
    modalId: PropTypes.string.isRequired
}

export default SettingsModal;