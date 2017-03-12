import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, browserHistory, IndexRedirect } from 'react-router';
import App from './app';
import ServicesDashboard from './components/services/serviceSummaryDashboardComponent';
import ClustersDashboard from './components/clusters/clusterSummaryDashboardComponent';
import LogsDashboard from './components/logs/logsDashboard/logsDashboardComponent';
import './index.css';

ReactDOM.render((
  <Router history={browserHistory}>
    <Route path="/" component={App}>
      <IndexRedirect to="/services" />
      <Route path="services" components={{body: ServicesDashboard}} />
      <Route path="clusters" components={{body: ClustersDashboard}} />
      <Route path="logs" components={{body: LogsDashboard}} />
    </Route>
  </Router>
  ),
  document.getElementById('root')
);