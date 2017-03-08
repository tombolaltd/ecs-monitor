import React, { Component } from 'react';
import { Event, fullScreenEvent$ } from '../../pubsub/eventStreams';

class FloatingActionMenu extends Component {
    constructor(props) {
        super(props);
        this.handleFullScreenClick = this.handleFullScreenClick.bind(this);
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
                        <a className="btn-floating orange" onClick={this.handleFullScreenClick}>
                            <i className="material-icons">aspect_ratio</i>
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
}

export default FloatingActionMenu;