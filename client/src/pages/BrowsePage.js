import React from 'react';
import { Grid, Menu, Dropdown } from 'semantic-ui-react';
import { Link, Switch, Route } from 'react-router-dom';
import { getLoggedInUsername, logout } from '../Util';
import PostPicturePage from './PostPicturePage';

/*
 * file - client/src/pages/BrowsePage.js
 * author - Patrick Richeal
 * 
 * Browse page to look through uploaded pictures
 */

export default class BrowsePage extends React.Component {

  constructor(props) {
    super(props);

    this.logout = this.logout.bind(this);
  }

  /**
   * Function to logout the current logged in user
   */
  logout() {
    logout();

    // Rerender component, logout call above will modify local storage
    this.forceUpdate();

    // Navigate to browse page
    this.props.history.push('/');
  }

  render() {
    return (
      <Grid textAlign='center'>
        <Grid.Column style={{ maxWidth: 600 }} textAlign='left'>
          <Menu style={{marginTop: '25px'}}>
            <Menu.Item header>AWP Pictures</Menu.Item>
            <Menu.Item as={Link} to='/'>Browse</Menu.Item>
            {getLoggedInUsername() &&
              <Menu.Item as={Link} to='/post-picture'>Post picture</Menu.Item>
            }
            
            <Menu.Menu position='right'>
              {!getLoggedInUsername() &&
                <Menu.Item as={Link} to='/login'>Login</Menu.Item>
              }
              {getLoggedInUsername() &&
                <Dropdown item text={getLoggedInUsername()}>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to='/change-password'>Change password</Dropdown.Item>
                    <Dropdown.Item onClick={this.logout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              }
            </Menu.Menu>
          </Menu>
          <Switch>
            <Route path="/post-picture" component={PostPicturePage} />
          </Switch>
        </Grid.Column>
      </Grid>
    );
  }
}