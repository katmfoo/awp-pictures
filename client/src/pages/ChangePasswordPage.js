import React from 'react';
import { Grid, Header, Form, Segment, Button } from 'semantic-ui-react';
import { Link } from "react-router-dom";
import { apiCall, getLoggedInUserId } from '../Util';

/*
 * file - client/src/pages/ChangePasswordPage.js
 * author - Patrick Richeal
 * 
 * Change password page
 */

export default class ChangePasswordPage extends React.Component {

  constructor(props) {
    super(props);

    // Setup state
    this.state = {
      current_password: '',
      current_password_error: '',
      password: '',
      password_error: '',
      confirm_password: '',
      confirm_password_error: '',
      change_password_loading: false,
      change_password_error: '',
      change_password_success: '',
      change_password_disabled: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.clearCurrentPasswordError= this.clearCurrentPasswordError.bind(this);
    this.validatePassword = this.validatePassword.bind(this);
    this.validateConfirmPassword = this.validateConfirmPassword.bind(this);
    this.changePassword = this.changePassword.bind(this);
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
   * Function to clear current password errors
   */
  clearCurrentPasswordError() {
    this.setState({current_password_error: ''});
  }

  /**
   * Function to validate password input
   */
  validatePassword() {
    // Clear password messages
    this.setState({password_error: ''});

    // Validate password length
    if (this.state.password && this.state.password.length < 8) {
      this.setState({password_error: 'Password must be 8 characters or more'})
    } else if (this.state.password.length > 256) {
      this.setState({password_error: 'Password must be 256 characters or less'});
    }

    this.validateConfirmPassword();
  }

  /**
   * Function to validate confirm password input
   */
  validateConfirmPassword() {
    // Clear confirm password messages
    this.setState({confirm_password_error: ''});

    // Make sure confirm password matches
    if (this.state.password && this.state.confirm_password && this.state.confirm_password !== this.state.password) {
      this.setState({confirm_password_error: "Passwords don't match"});
    }
  }

  /**
   * Function to attempt to change password, called on button click
   */
  async changePassword() {
    let should_submit = true;

    // Clear change password messages
    this.setState({
      change_password_error: '',
      change_password_success: ''
    });

    // Make sure all inputs are filled in
    if (!this.props.match.params.forgot_password_code && this.state.current_password === '') {
      this.setState({current_password_error: 'Current password is required'});
      should_submit = false;
    }
    if (this.state.password === '') {
      this.setState({password_error: 'New password is required'});
      should_submit = false;
    }
    if (this.state.confirm_password === '') {
      this.setState({confirm_password_error: 'Confirm new password is required'});
      should_submit = false;
    }

    // If any existing errors, don't continue
    if (this.state.password_error || this.state.confirm_password_error) {
      should_submit = false;
    }

    // If no errors, attempt to change password
    if (should_submit) {
      // Set change password button loading
      this.setState({change_password_loading: true});

      // Put together data to send to api
      let api_data = {
        password: this.state.password
      };

      if (this.props.match.params.forgot_password_code) {
        api_data['forgot_password_code'] = this.props.match.params.forgot_password_code;
      } else {
        api_data['current_password'] = this.state.current_password;
        api_data['user_id'] = getLoggedInUserId();
      }

      // Make api request to change password, ensure response time is atleast 1 second
      try {
        const [response] = await Promise.all([
          apiCall().put('/users/password', api_data),
          new Promise(resolve => setTimeout(resolve, 1000))
        ]);

        // Set error/success message
        if (response.data.error) {
          this.setState({change_password_error: response.data.error});
        } else {
          this.setState({
            change_password_success: 'Password updated successfully',
            change_password_disabled: true
          });
        }
      } catch (e) {
        this.setState({change_password_error: 'Change password failed'});
      }

      // Set change password button loading false
      this.setState({change_password_loading: false});
    }
  }

  render() {
    return (
      <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 400 }}>
          <Header as='h3' textAlign="left" style={{paddingLeft: '10px'}}>
            Change password
            <Link to="/" style={{ fontSize: '1rem', paddingLeft: '15px' }}>Back to browse</Link>
          </Header>
          <Form size='large' onSubmit={this.changePassword}>
            <Segment>
              {!this.props.match.params.forgot_password_code &&
                <Form.Field>
                  <Form.Input
                    name='current_password'
                    value={this.state.current_password}
                    onChange={this.handleInputChange}
                    onBlur={this.clearCurrentPasswordError}
                    error={this.state.current_password_error ? true : false}
                    disabled={this.state.change_password_disabled}
                    fluid
                    icon='lock'
                    iconPosition='left'
                    placeholder='Current password'
                    type='password'
                  />
                  {this.state.current_password_error &&
                    <div className="input-msg right error">{this.state.current_password_error}</div>
                  }
                </Form.Field>
              }
              <Form.Field>
                <Form.Input
                  name='password'
                  value={this.state.password}
                  onChange={this.handleInputChange}
                  onBlur={this.validatePassword}
                  error={this.state.password_error ? true : false}
                  disabled={this.state.change_password_disabled}
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='New password'
                  type='password'
                />
                {this.state.password_error &&
                  <div className="input-msg right error">{this.state.password_error}</div>
                }
              </Form.Field>
              <Form.Field>
                <Form.Input
                  name='confirm_password'
                  value={this.state.confirm_password}
                  onChange={this.handleInputChange}
                  onBlur={this.validateConfirmPassword}
                  error={this.state.confirm_password_error ? true : false}
                  disabled={this.state.change_password_disabled}
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='Confirm new password'
                  type='password'
                />
                {this.state.confirm_password_error &&
                  <div className="input-msg right error">{this.state.confirm_password_error}</div>
                }
              </Form.Field>
              {this.state.change_password_error &&
                <div className="input-msg right error">{this.state.change_password_error}</div>
              }
              {this.state.change_password_success &&
                <div className="input-msg right success">{this.state.change_password_success}</div>
              }
              <Button
                loading={this.state.change_password_loading}
                disabled={this.state.change_password_disabled}
                fluid
                size='medium'
                style={{marginTop: '20px'}}
              >
                Change password
              </Button>
            </Segment>
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}