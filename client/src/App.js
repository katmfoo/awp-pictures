import React from 'react';
import { BrowserRouter, Switch, Route, useParams } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import BrowsePage from './pages/BrowsePage';
import ChangePasswordPage from './pages/ChangePasswordPage';

import './App.css';

export default function App() {
  return (
    <BrowserRouter basename="/~richealp7/awp/awp-pictures/client/build">
      <Switch>
        <Route path="/create-account" component={CreateAccountPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/forgot-password" component={ForgotPasswordPage} />
        <Route path="/change-password/:forgot_password_code" component={ChangePasswordPage} />
        <Route path="/change-password" component={ChangePasswordPage} />
        <Route path="/" component={BrowsePage} />
      </Switch>
    </BrowserRouter>
  );
}