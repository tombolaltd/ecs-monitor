import React, { Component, PropTypes } from 'react';
import tippy from 'tippy.js';
import './tooltip.css';


class Tooltip extends Component {
    get defaultSettings() {
        return {
            trigger: 'mouseenter',
            arrow: true,
            html: `#${this.props.tooltipId}`
        };
    }

    componentDidMount() {
        tippy(this.props.triggerId, this.props.tippySettings || this.defaultSettings);
    }
    
    render() {
        return (
            <div className="tooltip" id={this.props.tooltipId}>
                {this.props.children || this.props.title}
            </div>
        );
    }
}

Tooltip.propTypes = {
    tooltipId: PropTypes.string.isRequired,
    triggerId: PropTypes.string.isRequired,
    tippySettings: PropTypes.object,
    title: PropTypes.string
};

export default Tooltip;