import React from 'react';
import { Grid, Header, Form, Segment, Button } from 'semantic-ui-react';
import { Link } from "react-router-dom";
import { apiCall, logout, emailValid } from '../Util';

/*
 * file - client/src/pages/ForgotPasswordPage.js
 * author - Patrick Richeal
 * 
 * Forgot password page
 */

export default class ForgotPasswordPage extends React.Component {

  constructor(props) {
    super(props);

    // Log user out if logged in
    logout();

    // Setup state
    this.state = {
      username: '',
      username_error: '',
      email: '',
      email_error: '',
      forgot_password_loading: false,
      forgot_password_error: '',
      forgot_password_success: '',
      forgot_password_disabled: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.clearUsernameError = this.clearUsernameError.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
  }

  /**
   * Function to handle input change event, updates state
   */
  handleInputChange(event) {
    const value = event.target.value;
    const name = event.target.name;

    this.setState({
      [name]: value
    });
  }

  /**
   * Function to clear username errors
   */
  clearUsernameError() {
    this.setState({username_error: ''});
  }

  /**
   * Function to validate email input
   */
  validateEmail() {
    // Clear email messages
    this.setState({email_error: ''});

    // If email invalid, give error
    if (this.state.email && (
      this.state.email.length < 3 || this.state.email.length > 256 || !emailValid(this.state.email)
    )) {
      this.setState({email_error: 'Email is invalid'});
    }
  }

  /**
   * Function to attempt to send forgot password request, called on button click
   */
  async forgotPassword() {
    let should_submit = true;

    // Clear forgot password messages
    this.setState({
      forgot_password_error: '',
      forgot_password_success: ''
    });

    // Make sure all inputs are filled in
    if (this.state.username === '') {
      this.setState({username_error: 'Username is required'});
      should_submit = false;
    }
    if (this.state.email === '') {
      this.setState({email_error: 'Email is required'});
      should_submit = false;
    }

    // If any existing errors, don't continue
    if (this.state.email_error) {
      should_submit = false;
    }

    // If no errors, attempt to make forgot password request
    if (should_submit) {
      // Set forgot password button loading
      this.setState({forgot_password_loading: true});

      // Make api request to forgot password, ensure response time is atleast 1 second
      const [response] = await Promise.all([
        apiCall().post('/users/forgot-password', {
          username: this.state.username,
          email: this.state.email
        }),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);

      // Set forgot password button loading false
      this.setState({forgot_password_loading: false});

      if (response.data.error) {
        this.setState({forgot_password_error: 'User not found'});
      } else {
        this.setState({
          forgot_password_success: 'Forgot password email sent',
          forgot_password_disabled: true
        });
      }
    }
  }

  render() {
    return (
      <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 400 }}>
          <Header as='h3' textAlign="left" style={{paddingLeft: '10px'}}>
            Forgot password
            <Link to="/login" style={{ fontSize: '1rem', paddingLeft: '15px' }}>Back to login</Link>
          </Header>
          <Form size='large' onSubmit={this.forgotPassword}>
            <Segment>
              <Form.Field>
                <Form.Input
                  name='username'
                  value={this.state.username}
                  onChange={this.handleInputChange}
                  onBlur={this.clearUsernameError}
                  error={this.state.username_error ? true : false}
                  disabled={this.state.forgot_password_disabled}
                  fluid
                  icon='user'
                  iconPosition='left'
                  placeholder='Username'
                />
                {this.state.username_error &&
                  <div className="input-msg right error">{this.state.username_error}</div>
                }
              </Form.Field>
              <Form.Field>
                <Form.Input
                  name='email'
                  value={this.state.email}
                  onChange={this.handleInputChange}
                  onBlur={this.validateEmail}
                  error={this.state.email_error ? true : false}
                  disabled={this.state.forgot_password_disabled}
                  fluid
                  icon='envelope'
                  iconPosition='left'
                  placeholder='Email'
                />
                {this.state.email_error &&
                  <div className="input-msg right error">{this.state.email_error}</div>
                }
              </Form.Field>
              {this.state.forgot_password_error &&
                <div className="input-msg right error">{this.state.forgot_password_error}</div>
              }
              {this.state.forgot_password_success &&
                <div className="input-msg right success">{this.state.forgot_password_success}</div>
              }
              <Button
                loading={this.state.forgot_password_loading}
                disabled={this.state.forgot_password_disabled}
                fluid
                size='medium'
                style={{marginTop: '20px'}}
              >
                Send forgot password email
              </Button>
            </Segment>
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}