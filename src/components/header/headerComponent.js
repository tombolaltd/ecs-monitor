import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { MOUNTING_PATH } from '../../../globalConfig';

import clock from './icons/clock.svg';
import cloud from './icons/cloud.svg';
import './headerComponent.css';


const homePagePath = MOUNTING_PATH;
const servicePagePath = MOUNTING_PATH + 'services';
const clusterPagePath = MOUNTING_PATH + 'clusters';
const agentsPagePath = MOUNTING_PATH + 'agents';
const logsPagePath = MOUNTING_PATH + 'logs';


class Header extends Component {    

    processActiveClassName(route) {
        if (!this.props.activePath) return;

        return route === this.props.activePath ? 'active' : '';
    }
    
    render() {
        return (
           <nav className="header-container">
                <div className="nav-wrapper teal">
                    <Link to={homePagePath} className="brand-logo">
                        <img src={cloud} role="presentation" className="logo-img" />
                        <img src={clock} role="presentation" className="logo-img" />
                    </Link>
                    <ul className="right hide-on-med-and-down">
                        <li className={this.processActiveClassName(servicePagePath)}>
                            <Link to={servicePagePath}>Services</Link>
                        </li>
                        <li className={this.processActiveClassName(clusterPagePath)}>
                            <Link to={clusterPagePath}>Clusters</Link>
                        </li>
                        <li className={this.processActiveClassName(agentsPagePath)}>
                            <Link to={agentsPagePath}>Agents</Link>
                        </li>
                        <li className={this.processActiveClassName(logsPagePath)}>
                            <Link to={logsPagePath}>Logs</Link>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }
}

Header.propTypes = {
    activePath: PropTypes.string
}

export default Header;