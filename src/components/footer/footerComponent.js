import React, { Component } from 'react';
import './footerComponent.css';

class Footer extends Component {
    render() {
        return (
            <footer className="page-footer teal">
                <div className="footer-copyright">
                    <div className="container">
                        by tombola
                    </div>
                </div>
            </footer>
        );
    }
}

export default Footer;