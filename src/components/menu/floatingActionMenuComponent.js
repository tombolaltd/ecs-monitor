import React, { Component } from 'react';
import { Event, fullScreenEvent$, settingsEvent$ } from '../../pubsub/eventStreams';

class FloatingActionMenu extends Component {
    constructor(props) {
        super(props);
        this.handleFullScreenClick = this.handleFullScreenClick.bind(this);
        this.handleSettingsClick = this.handleSettingsClick.bind(this);
    }

    handleSettingsClick(evt) {
        settingsEvent$.next(new Event(this, 'open'));
    }

    handleFullScreenClick(evt) {
        fullScreenEvent$.next(new Event(this, evt));
    }
    
    render() {
        return (
            <div className="fixed-action-btn">
                <a className="btn-floating btn-large teal darken-1">
                    <i className="large material-icons">mode_edit</i>
                </a>
                <ul>
                    <li>
                        <a className="btn-floating green" onClick={this.handleSettingsClick}>
                            <i className="material-icons">settings</i>
                        </a>
                    </li>
                    <li>
                        <a className="btn-floating blue lighten-1" onClick={this.handleFullScreenClick}>
                            <i className="material-icons">aspect_ratio</i>
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
}

export default FloatingActionMenu;