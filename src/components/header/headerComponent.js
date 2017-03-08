import React, { Component, PropTypes } from 'react';

import { Link } from 'react-router';
import { fullScreenEvent$ } from '../../pubsub/eventStreams';

import clock from './icons/clock.svg';
import cloud from './icons/cloud.svg';
import './headerComponent.css';


class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fullScreenMode: false
        };
    }
    
    componentDidMount() {
        fullScreenEvent$.subscribe(this.handleFullScreenRequestEvent.bind(this));
    }

    componentWillUnmount() {
        fullScreenEvent$.unsubscribe();
    }
    
    handleFullScreenRequestEvent() {
        if (this.state.fullScreenMode) {
            // turn off
            this.setState({ fullScreenMode: false });
        } else {
            // turn on
            this.setState({ fullScreenMode: true });
        }
    }

    processActiveClassName(route) {
        if (!this.props.activePath) return;

        return route === this.props.activePath ? 'active' : '';
    }
    
    render() {
        const showOrHideClassName = this.state.fullScreenMode
            ? 'hide'
            : 'show' ;
        return (
           <nav className={showOrHideClassName}>
                <div className="nav-wrapper teal">
                    <Link to="/" className="brand-logo">
                        <img src={cloud} role="presentation" className="logo-img" />
                        <img src={clock} role="presentation" className="logo-img" />
                    </Link>
                    <ul className="right hide-on-med-and-down">
                        <li className={this.processActiveClassName('/services')}><Link to="/services">Services</Link></li>
                        <li className={this.processActiveClassName('/clusters')}><Link to="/clusters">Clusters</Link></li>
                        <li className={this.processActiveClassName('/logs')}><Link to="/logs">Logs</Link></li>
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