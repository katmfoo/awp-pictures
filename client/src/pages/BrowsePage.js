import React from 'react';
import { Grid, Menu, Dropdown, Item, Icon, Button, Loader } from 'semantic-ui-react';
import { Link, Switch, Route } from 'react-router-dom';
import queryString from 'query-string'
import moment from 'moment';
import { getLoggedInUsername, logout, apiCall, getLoggedInUserId } from '../Util';
import PostPicturePage from './PostPicturePage';
import PicturePage from './PicturePage';

/*
 * file - client/src/pages/BrowsePage.js
 * author - Patrick Richeal
 * 
 * Browse page to look through uploaded pictures
 */

export default class BrowsePage extends React.Component {

  constructor(props) {
    super(props);

    // Setup state
    this.state = {
      pictures_loading: true,
      pictures: [],
      page: 1,
      order: 'desc',
      last_page: 1
    }

    this.handleOrderChange = this.handleOrderChange.bind(this);
    this.getPictures = this.getPictures.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.prevPage = this.prevPage.bind(this);
    this.logout = this.logout.bind(this);
    this.deleteAccount = this.deleteAccount.bind(this);
  }

  /**
   * Called when component loads
   */
  componentDidMount() {
    // Get query params
    let queryParams = queryString.parse(this.props.location.search);

    // Set query params to state, once done, get pictures
    this.setState({
      page: queryParams.page || 1,
      order: queryParams.order || 'desc'
    }, this.getPictures);
  }

  /**
   * Function to handle sort by change event, updates state and reloads pictures
   */
  handleOrderChange = (e, { value }) => {
    this.props.history.push('/?page=' + this.state.page + '&order=' + value);
    this.setState({order: value}, this.getPictures);
  };

  /**
   * Function to go to the next page
   */
  nextPage() {
    this.props.history.push('/?page=' + (this.state.page + 1) + '&order=' + this.state.order);
    this.setState((state) => ({
      page: state.page + 1
    }), this.getPictures);
  }

  /**
   * Function to go to the previous page
   */
  prevPage() {
    this.props.history.push('/?page=' + (this.state.page - 1) + '&order=' + this.state.order);
    this.setState((state) => ({
      page: state.page - 1
    }), this.getPictures);
  }

  /**
   * Function to get pictures from the api
   */
  async getPictures() {
    // Set pictures loading
    this.setState({pictures_loading: true});

    // Make api call to get pictures
    let response = await apiCall().get('/pictures', {
      params: {
        page: this.state.page,
        order: this.state.order,
        page_size: 4
      }
    });

    // Set picture data to state
    this.setState({
      pictures: response.data.pictures,
      page: response.data.pagination.current_page,
      last_page: response.data.pagination.last_page
    });

    // Set pictures loading false
    this.setState({pictures_loading: false});
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

  /**
   * Function to delete account
   */
  async deleteAccount() {
    // Show confirmation for deleting account
    let should_delete = window.confirm('Are you sure you want to delete your account?');

    if (should_delete) {
      // Make api call to delete comment
      await apiCall().delete('/users/' + getLoggedInUserId());

      // Logout user
      logout();

      // Refresh pictures
      this.getPictures();

      // Go to browse page
      this.props.history.push('/');
    }
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
                    <Dropdown.Item onClick={this.deleteAccount}>Delete account</Dropdown.Item>
                    <Dropdown.Item onClick={this.logout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              }
            </Menu.Menu>
          </Menu>
          <Switch>
            <Route path='/post-picture'>
              <PostPicturePage refreshBrowsePictures={this.getPictures} />
            </Route>
            <Route path="/picture/:picture_id" component={PicturePage} />
            <Route path="/">
              <div style={{marginTop: '20px'}}>
                Sort by&nbsp;
                <Dropdown inline options={[
                  {key: 1, text: 'newest', value: 'desc'},
                  {key: 2, text: 'oldest', value: 'asc'}
                ]} value={this.state.order} onChange={this.handleOrderChange} />
              </div>
              {this.state.pictures.length === 0 && !this.state.pictures_loading &&
                <div style={{marginTop: '45px'}}>No pictures</div>
              }
              {this.state.pictures_loading &&
                <div style={{marginTop: '200px'}}>
                  <Loader active={this.state.pictures_loading}>Loading</Loader>
                </div>
              }
              <Item.Group divided>
                {this.state.pictures.map((picture) => {
                  return (
                    <Item key={picture.picture_id}>
                      <Item.Image size='tiny' src={picture.url} />
                
                      <Item.Content verticalAlign='middle'>
                        <Link to={'/picture/' + picture.picture_id}><Item.Header style={{marginTop: '3px', fontSize: '1.2rem', fontWeight: 'bold'}}>{picture.title}</Item.Header></Link>
                        <Item.Meta>posted by {picture.username}</Item.Meta>
                        <Item.Extra style={{marginTop: '-1px'}}><Icon fitted name='comment' /> {picture.comments.length} comments <Icon fitted name='time' style={{paddingLeft: '10px'}}/> {moment.utc(picture.created_at).local().fromNow()}</Item.Extra>
                      </Item.Content>
                    </Item>
                  )
                })}
              </Item.Group>
              <div style={{textAlign: 'center', margin: '50px 0 20px 0'}}>
                <Button.Group basic>
                  <Button icon='angle left' disabled={this.state.page === 1} onClick={this.prevPage} />
                  <Button disabled>{this.state.page}</Button>
                  <Button icon='angle right' disabled={this.state.page === this.state.last_page} onClick={this.nextPage} />
                </Button.Group>
              </div>
            </Route>
          </Switch>
        </Grid.Column>
      </Grid>
    );
  }
}