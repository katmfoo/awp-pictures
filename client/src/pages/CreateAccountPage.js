import React from 'react';
import { Grid, Header, Form, Segment, Button } from 'semantic-ui-react';
import { Link } from "react-router-dom";
import { apiCall, emailValid, logout } from '../Util';

/*
 * file - client/src/pages/CreateAccountPage.js
 * author - Patrick Richeal
 * 
 * Create account page
 */

export default class CreateAccountPage extends React.Component {

  constructor(props) {
    super(props);

    // Log user out if logged in
    logout();

    // Setup state
    this.state = {
      username: '',
      username_error: '',
      username_success: '',
      username_loading: false,
      email: '',
      email_error: '',
      password: '',
      password_error: '',
      confirm_password: '',
      confirm_password_error: '',
      create_account_loading: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.validateUsername = this.validateUsername.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
    this.validatePassword = this.validatePassword.bind(this);
    this.validateConfirmPassword = this.validateConfirmPassword.bind(this);
    this.createAccount = this.createAccount.bind(this);
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
   * Function to validate username input
   */
  async validateUsername() {
    // Clear username messages
    this.setState({
      username_error: '',
      username_success: ''
    });

    // Validate username length
    if (this.state.username && this.state.username.length < 4) {
      this.setState({username_error: 'Username must be 4 characters or more'});
    } else if (this.state.username.length > 32) {
      this.setState({username_error: 'Username must be 32 characters or less'});
    } else if (this.state.username) {
      // Set username loading
      this.setState({username_loading: true});

      // Make api request to see if username is taken, ensure response time
      // is atleast 1 second
      const [response] = await Promise.all([
        apiCall.get('/users/username-taken', {
          params: {
            username: this.state.username
          }
        }),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);

      // Set error or success depending on whether or not username is taken
      if (response.data.taken) {
        this.setState({username_error: 'Username is taken'});
      } else {
        this.setState({username_success: 'Username is available'});
      }

      // Set username loading false
      this.setState({username_loading: false});
    }
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
   * Function to attempt to create the account, called on create account button click
   */
  async createAccount() {
    let should_submit = true;

    // Make sure all inputs are filled in
    if (this.state.username === '') {
      this.setState({username_error: 'Username is required'});
      should_submit = false;
    }
    if (this.state.email === '') {
      this.setState({email_error: 'Email is required'});
      should_submit = false;
    }
    if (this.state.password === '') {
      this.setState({password_error: 'Password is required'});
      should_submit = false;
    }
    if (this.state.confirm_password === '') {
      this.setState({confirm_password_error: 'Confirm password is required'});
      should_submit = false;
    }

    // If any existing errors, don't create account
    if (this.state.username_error || this.state.email_error || this.state.password_error || this.state.confirm_password_error) {
      should_submit = false;
    }

    // If no errors, attempt to create account
    if (should_submit) {
      // Set create account button loading
      this.setState({create_account_loading: true});

      // Make api request to create account, ensure response time
      // is atleast 1 second
      const [response] = await Promise.all([
        apiCall.post('/users', {
          username: this.state.username,
          password: this.state.password,
          email: this.state.email
        }),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);

      // Set create account button loading false
      this.setState({create_account_loading: false});

      // Set user in local storage
      localStorage.setItem('user_id', response.data.user_id);
      localStorage.setItem('username', response.data.username);

      // Navigate to browse page
      this.props.history.push('/');
    }
  }

  render() {
    return (
      <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 400 }}>
          <Header as='h3' textAlign="left" style={{ paddingLeft: '10px' }}>
            Create account
            <Link to="/login" style={{ fontSize: '1rem', paddingLeft: '15px' }}>Back to login</Link>
          </Header>
          <Form size='large' onSubmit={this.createAccount}>
            <Segment>
              <Form.Field>
                <Form.Input
                  name="username"
                  value={this.state.username}
                  onChange={this.handleInputChange}
                  onBlur={this.validateUsername}
                  loading={this.state.username_loading}
                  error={this.state.username_error ? true : false}
                  fluid
                  icon='user'
                  iconPosition='left'
                  placeholder='Username'
                />
                {this.state.username_error &&
                  <div className="input-msg error">{this.state.username_error}</div>
                }
                {this.state.username_success &&
                  <div className="input-msg success">{this.state.username_success}</div>
                }
              </Form.Field>
              <Form.Field>
                <Form.Input
                  name="email"
                  value={this.state.email}
                  onChange={this.handleInputChange}
                  onBlur={this.validateEmail}
                  error={this.state.email_error ? true : false}
                  fluid
                  icon='envelope'
                  iconPosition='left'
                  placeholder='Email'
                />
                {this.state.email_error &&
                  <div className="input-msg error">{this.state.email_error}</div>
                }
              </Form.Field>
              <Form.Field>
                <Form.Input
                  name="password"
                  value={this.state.password}
                  onChange={this.handleInputChange}
                  onBlur={this.validatePassword}
                  error={this.state.password_error ? true : false}
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='Password'
                  type='password'
                />
                {this.state.password_error &&
                  <div className="input-msg error">{this.state.password_error}</div>
                }
              </Form.Field>
              <Form.Field>
                <Form.Input
                  name="confirm_password"
                  value={this.state.confirm_password}
                  onChange={this.handleInputChange}
                  onBlur={this.validateConfirmPassword}
                  error={this.state.confirm_password_error ? true : false}
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='Confirm password'
                  type='password'
                />
                {this.state.confirm_password_error &&
                  <div className="input-msg error">{this.state.confirm_password_error}</div>
                }
              </Form.Field>
  
              <Button
                fluid
                size='medium'
                style={{marginTop: '20px'}}
                loading={this.state.create_account_loading}
              >
                Create account
              </Button>
            </Segment>
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}