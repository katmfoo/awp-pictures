import React from 'react';
import { Form, Header, TextArea, Button, Image, Icon, Comment } from 'semantic-ui-react';
import moment from 'moment';
import { apiCall, getLoggedInUserId } from '../Util';

/*
 * file - client/src/pages/PicturePage.js
 * author - Patrick Richeal
 * 
 * Picture page
 */

export default class PicturePage extends React.Component {

  constructor(props) {
    super(props);

    // Setup state
    this.state = {
      picture: {},
      comment: '',
      comment_error: '',
      comment_loading: false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.validateComment = this.validateComment.bind(this);
    this.getPicture = this.getPicture.bind(this);
    this.postComment = this.postComment.bind(this);
  }

  /**
   * Called when component loads
   */
  componentDidMount() {
    this.getPicture();
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
   * Function to validate comment textarea
   */
  validateComment() {
    // Clear comment error
    this.setState({comment_error: ''});

    // Validate comment length
    if (this.state.comment.length > 256) {
      this.setState({comment_error: 'Comment must be 256 characters or less'});
    }
  }

  /**
   * Function to retrieve the picture
   */
  async getPicture() {
    // Make api request to get picture
    const response = await apiCall().get('/pictures/' + this.props.match.params.picture_id);

    // Set picture to state
    this.setState({picture: response.data.picture});
  }

  /**
   * Function to delete a comment
   */
  async deleteComment(comment) {
    // Show confirmation for deleting comment
    let should_delete = window.confirm('Are you sure you want to delete this comment?');

    if (should_delete) {
      // Make api call to delete comment
      await apiCall().delete('/pictures/' + this.state.picture.picture_id + '/comments/' + comment.comment_id);

      // Reload picture
      this.getPicture();
    }
  }

  /**
   * Function to post a comment
   */
  async postComment() {
    let should_submit = true;

    // Make sure all required inputs are filled in
    if (this.state.comment === '') {
      this.setState({comment_error: 'Comment is required'});
      should_submit = false;
    }

    // If any existing errors, don't post comment
    if (this.state.comment_error) {
      should_submit = false;
    }

    // If no errors, attempt to post comment
    if (should_submit) {
      // Set post comment button loading
      this.setState({comment_loading: true});

      // Make api call to post comment
      await Promise.all([
        apiCall().post('/pictures/' + this.state.picture.picture_id + '/comments', {
          comment: this.state.comment
        }),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);

      // Refresh picture
      this.getPicture();

      // Set post comment button loading false, comment value empty string
      this.setState({
        comment_loading: false,
        comment: ''
      });
    }
  }

  render() {
    return (
      <div>
        <Header as='h3' style={{marginTop: '25px'}}>{this.state.picture.title}</Header>
        <Image src={this.state.picture.url} style={{margin: 'auto'}} />
        <div style={{marginTop: '13px'}}>{ this.state.picture.caption }</div>
        <div style={{color: 'rgba(0,0,0,.4)', marginTop: '5px'}}>
          posted by {this.state.picture.username}
          <span style={{float: 'right'}}>
            <Icon fitted name='comment' /> { this.state.picture.comments ? this.state.picture.comments.length : 0 } comments <Icon fitted name='time' style={{paddingLeft: '10px'}}/> {moment.utc(this.state.picture.created_at).local().fromNow()}
          </span>
        </div>

        {this.state.picture.comments  ? (this.state.picture.comments.length === 0 ? <div style={{margin: '20px 0'}}>No comments</div> : null) : null}

        <Comment.Group>
          {this.state.picture.comments ? this.state.picture.comments.map((comment) => {
            return (
              <Comment key={comment.comment_id}>
                <Comment.Content>
                  <Comment.Author>{comment.username ? comment.username : '[deleted]'}&nbsp;&nbsp;<span style={{fontSize: '12.25px', color: 'rgba(0,0,0,.4)', fontWeight: 'normal'}}>{moment.utc(comment.created_at).local().fromNow()}</span></Comment.Author>
                  <Comment.Text>{comment.comment ? comment.comment : '[deleted]'}</Comment.Text>
                  {comment.comment != null && getLoggedInUserId() && (comment.user_id === getLoggedInUserId() || this.state.picture.user_id === getLoggedInUserId()) &&
                    <Comment.Actions>
                      <Comment.Action onClick={() => this.deleteComment(comment)}>Delete</Comment.Action>
                    </Comment.Actions>
                  }
                </Comment.Content>
              </Comment>
            )
          }) : null}
        </Comment.Group>
        
        {getLoggedInUserId() &&
          <div>
            <Header as='h3'>Post a comment</Header>
            <Form size='large' onSubmit={this.postComment}>
              <Form.Field>
                <TextArea
                  name='comment'
                  value={this.state.comment}
                  onChange={this.handleInputChange}
                  onBlur={this.validateComment}
                  placeholder='Comment'
                  style={{fontFamily: 'lato'}}
                />
                <div className="input-msg right error" style={{marginTop: '4px'}}>
                  {this.state.comment_error &&
                    <span style={{float: 'left', paddingLeft: '5px'}}>{this.state.comment_error}</span>
                  }
                  <span style={{color: '#a2a2a2'}}>{256 - this.state.comment.length > 0 ? 256 - this.state.comment.length : 0} chars left</span>
                </div>
              </Form.Field>
  
              <Button
                size='medium'
                style={{margin: '4px 0 20px 0'}}
                loading={this.state.comment_loading}
              >
                Post comment
              </Button>
            </Form>
          </div>
        }
      </div>
    );
  }
}