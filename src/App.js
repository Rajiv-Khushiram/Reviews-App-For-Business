import React, { Component } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar';
import Dashboard from './components/dashboard/Dashboard';
import ReviewForm from './components/review-form'
import SuccessReviewForm from './components/successReviewForm'
import SignIn from './components/auth/SignIn';
import TargetCustomerPage from './components/target-customer-page';
// import Widget from './components/widget';
import { connect } from 'react-redux';
import SMSCampaignPage from './components/sms-campaign';

import './index.css';

const ProtectedRoute = ({ isAllowed, ...props }) =>
     isAllowed
     ? <Route {...props}/>
     : <Redirect to="/signin"/>;

class App extends Component {
  render() {
    const { auth } = this.props;
    return (
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <Switch>
            <ProtectedRoute isAllowed = {auth.uid} exact path='/' component={Dashboard} />
            <ProtectedRoute isAllowed = {auth.uid} exact path='/review-form' component={ReviewForm} />
            <ProtectedRoute isAllowed = {auth.uid} exact path='/review-form-success' component={SuccessReviewForm} />
            <ProtectedRoute isAllowed = {auth.uid} exact path='/customer-page' component={TargetCustomerPage} />
            <ProtectedRoute isAllowed = {auth.uid}  exact path='/sms-campaign-form' component={SMSCampaignPage} />
            
            <Route path='/signin' component={SignIn} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = (state) => {
  return{
      auth:state.firebase.auth
  }
}

export default connect(mapStateToProps)(App);
