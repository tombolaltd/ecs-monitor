import React, { Component } from 'react';
import Header from './components/header/headerComponent';
import Footer from './components/footer/footerComponent';
import FloatingActionMenu from './components/menu/floatingActionMenuComponent';
import './app.css';

class App extends Component {
  render() {
    return (
      <div className="app">
        <Header activePath={this.props.location.pathname} />
        <div className="nav-and-body-wrapper">
          <div className="page-body">
                {this.props.body}
          </div>
        </div>
        <Footer />
        <FloatingActionMenu />
      </div>
    );
  }
}

export default App;
