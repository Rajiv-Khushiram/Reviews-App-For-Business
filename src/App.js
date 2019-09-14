import React, { Component } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import Navbar from './components/Navbar';
import ReviewForm from './components/review-form'
import SuccessReviewForm from './components/successReviewForm'
import SignIn from './components/auth/SignIn';
import TargetCustomerPage from './components/target-customer-page';
import AllPhotos from './components/AllPhotos';
import Debug from './components/Debug';
import Settings from './components/Settings';
import { connect } from 'react-redux';

import { getAccount } from './actions/accountActions';
import { getBusiness } from "./actions/businessActions";
import { getPhoto } from "./actions/photoActions";

import "./styles/antd.less";

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
            <ProtectedRoute isAllowed = {auth.uid} exact path='/' component={ReviewForm} />
            <ProtectedRoute isAllowed = {auth.uid} exact path='/new-review' component={ReviewForm} />
            <ProtectedRoute isAllowed = {auth.uid} exact path='/review-form-success' component={SuccessReviewForm} />
            <ProtectedRoute isAllowed = {auth.uid} exact path='/all-photos' component={AllPhotos} />            
            <ProtectedRoute isAllowed = {auth.uid} exact path='/settings' component={Settings} />            
            <ProtectedRoute isAllowed = {auth.uid} exact path='/debug' component={Debug} />            
            <ProtectedRoute isAllowed = {auth.uid} exact path='/sms-campaign' component={TargetCustomerPage} />            
            <Route path='/signin' component={SignIn} />
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = (state) => {
  return{
      auth:state.firebase.auth,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getBusiness: () => dispatch(getBusiness()),
    getAccount: () => dispatch(getAccount()),
    getPhoto: () => dispatch(getPhoto()),
    dispatch
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
