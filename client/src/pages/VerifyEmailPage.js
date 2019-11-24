import React from 'react';
import { Grid, Header, Loader, Segment, Message } from 'semantic-ui-react';
import { Link } from "react-router-dom";
import { apiCall } from '../Util';

/*
 * file - client/src/pages/VerifyEmailPage.js
 * author - Patrick Richeal
 * 
 * Verify email page
 */

export default class VerifyEmailPage extends React.Component {

  constructor(props) {
    super(props);

    // Setup state
    this.state = {
      verify_email_loading: true,
      verify_email_error: '',
      verify_email_success: ''
    };

    this.verifyEmail = this.verifyEmail.bind(this);
  }

  /**
   * Called when component loads
   */
  componentDidMount() {
    this.verifyEmail();
  }

  /**
   * Function to verify email with given code, called on page load
   */
  async verifyEmail() {

    try {
      // Make api request to verify email, ensure response time is atleast 1 second
      const [response] = await Promise.all([
        apiCall().post('/users/verify-email', {
          verification_code: this.props.match.params.verification_code
        }),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);

      // Set error/success message
      if (response.data.error) {
        this.setState({verify_email_error: response.data.error});
      } else {
        this.setState({verify_email_success: response.data.email + ' verified successfully'});
      }
    } catch (e) {
      this.setState({verify_email_error: 'Verification code not found'});
    }

    // Set verify email loading false
    this.setState({verify_email_loading: false});
  }

  render() {
    return (
      <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
        <Grid.Column style={{ maxWidth: 400 }}>
          <Header as='h3' textAlign="left" style={{paddingLeft: '10px'}}>
            Verify email
            <Link to="/" style={{ fontSize: '1rem', paddingLeft: '15px' }}>Go to browse</Link>
          </Header>
          <Segment style={{height: '100px'}}>
            <Loader active={this.state.verify_email_loading}>Loading</Loader>
            {this.state.verify_email_success &&
              <Message positive>
                <p>{this.state.verify_email_success}</p>
              </Message>
            }
            {this.state.verify_email_error &&
              <Message negative>
                <p>{this.state.verify_email_error}</p>
              </Message>
            }
          </Segment>
        </Grid.Column>
      </Grid>
    );
  }
}