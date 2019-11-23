import React from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import BrowsePage from './pages/BrowsePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

import 'semantic-ui-css/semantic.min.css'
import './App.css';

/*
 * file - client/src/App.js
 * author - Patrick Richeal
 * 
 * App component, sets up routes for entire website
 */

export default function App() {
  return (
    <BrowserRouter basename="/~richealp7/awp/awp-pictures/client/build">
      <Switch>
        <Route path="/create-account" component={CreateAccountPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/change-password/:forgot_password_code" component={ChangePasswordPage} />
        <Route path="/change-password" component={ChangePasswordPage} />
        <Route path="/verify-email/:verification_code" component={VerifyEmailPage} />
        <Route path="/" component={BrowsePage} />
      </Switch>
    </BrowserRouter>
  );
}