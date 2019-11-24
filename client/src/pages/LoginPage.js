import React from 'react';
import { Grid, Header, Form, Segment, Button } from 'semantic-ui-react';
import { Link } from "react-router-dom";
import { apiCall, logout } from '../Util';

/*
 * file - client/src/pages/LoginPage.js
 * author - Patrick Richeal
 * 
 * Login page
 */

export default class LoginPage extends React.Component {

  constructor(props) {
    super(props);

    // Log user out if logged in
    logout();

    // Setup state
    this.state = {
      username: '',
      username_error: '',
      password: '',
      password_error: '',
      login_loading: false,
      login_error: ''
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.clearUsernameError = this.clearUsernameError.bind(this);
    this.clearPasswordError = this.clearPasswordError.bind(this);
    this.login = this.login.bind(this);
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
   * Function to clear password errors
   */
  clearPasswordError() {
    this.setState({password_error: ''});
  }

  /**
   * Function to attempt to login, called on login button click
   */
  async login() {
    let should_submit = true;

    // Clear login error
    this.setState({login_error: ''});

    // Make sure all inputs are filled in
    if (this.state.username === '') {
      this.setState({username_error: 'Username is required'});
      should_submit = false;
    }
    if (this.state.password === '') {
      this.setState({password_error: 'Password is required'});
      should_submit = false;
    }

    // If no errors, attempt to login
    if (should_submit) {
      // Set login button loading
      this.setState({login_loading: true});

      // Make api request to login, ensure response time is atleast 1 second
      const [response] = await Promise.all([
        apiCall.post('/users/login', {
          username: this.state.username,
          password: this.state.password
        }),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);

      // Set login button loading false
      this.setState({login_loading: false});

      if (response.data.error) {
        this.setState({login_error: 'Invalid login credentials'});
      } else {
        // Set user in local storage
        localStorage.setItem('user_id', response.data.user_id);
        localStorage.setItem('username', response.data.username);

        // Navigate to browse page
        this.props.history.push('/');
      }
    }
  }

  render() {
    return (
      <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 400 }}>
          <Header as='h3' textAlign="left" style={{paddingLeft: '10px'}}>
            Login
            <Link to="/" style={{ fontSize: '1rem', paddingLeft: '15px' }}>Back to browse</Link>
          </Header>
          <Form size='large' onSubmit={this.login}>
            <Segment>
              <Form.Field>
                <Form.Input
                  name='username'
                  value={this.state.username}
                  onChange={this.handleInputChange}
                  onBlur={this.clearUsernameError}
                  error={this.state.username_error ? true : false}
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
                  name='password'
                  value={this.state.password}
                  onChange={this.handleInputChange}
                  onBlur={this.clearPasswordError}
                  error={this.state.password_error ? true : false}
                  fluid
                  icon='lock'
                  iconPosition='left'
                  placeholder='Password'
                  type='password'
                />
                {this.state.password_error &&
                  <div className="input-msg right error">{this.state.password_error}</div>
                }
              </Form.Field>
              {this.state.login_error &&
                <div className="input-msg right error">{this.state.login_error}</div>
              }
              <Button
                loading={this.state.login_loading}
                fluid
                size='medium'
                style={{marginTop: '20px'}}
              >
                Login
              </Button>
              <div style={{ padding: '16px 0 20px 0'}}>
                <Link to="/create-account" style={{ float: 'left' }}>Create account</Link>
                <Link to="/forgot-password" style={{ float: 'right' }}>Forgot password</Link>
              </div>
            </Segment>
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}