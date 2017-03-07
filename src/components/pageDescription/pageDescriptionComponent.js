import React, { Component, PropTypes } from 'react';
import ActiveSpinner from '../spinners/activeSpinnerComponent';
import './pageDescriptionComponent.css';

class PageDescription extends Component {
    render() {
        const containerClassName = this.props.className ? this.props.className : 'blue lighten-4' ;
        return (
            <div className={`page-details card-panel ${containerClassName}`}>
                <div>
                    <ActiveSpinner className="left active-spinner fade-in" />
                    <h5 className="header">{this.props.header}</h5>
                    <em className="last-updated-stamp">last update: {this.props.lastUpdateStamp}</em>
                </div>
            </div>
        );
    }
}

PageDescription.propTypes = {
    header: PropTypes.string.isRequired,
    lastUpdateStamp: PropTypes.string,
    className: PropTypes.string
}

export default PageDescription;