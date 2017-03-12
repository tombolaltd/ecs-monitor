import React, { Component } from 'react';
import Header from './components/header/headerComponent';
import Footer from './components/footer/footerComponent';
import FloatingActionMenu from './components/menu/floatingActionMenuComponent';
import { fullScreenEvent$ } from './pubsub/eventStreams';
import { attachAllPageEventHandlers, detachAllPageEventHandlers } from './pubsub/eventHandlers';

// css
import 'nprogress/nprogress.css';
import './app.css';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullScreenMode: false
    };
  }
  
  componentDidMount() {
    fullScreenEvent$.subscribe(this.handleFullScreenRequestEvent.bind(this));
    attachAllPageEventHandlers();
  }

  componentWillUnmount() {
    fullScreenEvent$.unsubscribe();
    detachAllPageEventHandlers();
  }

  handleFullScreenRequestEvent() {
    if (this.state.fullScreenMode) {
      this.setState({
        fullScreenMode: false
      });
    } else {
      this.setState({
        fullScreenMode: true
      });
    }
  }
  
  render() {
  const fullScreenModeClass = this.state.fullScreenMode ? 'fullscreen' : '';

    return (
      <div className={`app ${fullScreenModeClass}`}>
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
