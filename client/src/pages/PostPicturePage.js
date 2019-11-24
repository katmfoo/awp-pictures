import React from 'react';
import { Segment, Form, Header, TextArea, Button } from 'semantic-ui-react';
import { apiCall } from '../Util';

/*
 * file - client/src/pages/PostPicturePage.js
 * author - Patrick Richeal
 * 
 * Post picture page
 */

export default class PostPicturePage extends React.Component {

  constructor(props) {
    super(props);

    // Setup state
    this.state = {
      picture: '',
      picture_file: undefined,
      picture_error: '',
      title: '',
      title_error: '',
      caption: '',
      caption_error: '',
      post_picture_loading: false,
      post_picture_error: ''
    };

    this.handlePictureChange = this.handlePictureChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.validateTitle = this.validateTitle.bind(this);
    this.postPicture = this.postPicture.bind(this);
  }

  /**
   * Function to handle picture input change event, updates state and clears errors
   */
  handlePictureChange(event) {
    this.setState({
      picture: event.target.value,
      picture_file: event.target.files[0],
      picture_error: ''
    });
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
   * Function to validate title input
   */
  validateTitle() {
    // Clear title error
    this.setState({title_error: ''});

    // Validate title length
    if (this.state.title.length > 64) {
      this.setState({title_error: 'Title must be 64 characters or less'});
    }
  }

  validateCaption() {
    // Clear caption error
    this.setState({caption_error: ''});

    // Validate caption length
    if (this.state.caption.length > 256) {
      this.setState({caption_error: 'Caption must be 256 characters or less'});
    }
  }

  /**
   * Function to attempt to upload the picture
   */
  async postPicture() {
    let should_submit = true;

    console.log(this.state);

    // Make sure all required inputs are filled in
    if (this.state.picture === '') {
      this.setState({picture_error: 'Picture is required'});
      should_submit = false;
    }
    if (this.state.title === '') {
      this.setState({title_error: 'Title is required'});
      should_submit = false;
    }

    // If any existing errors, don't post picture
    if (this.state.title_error) {
      should_submit = false;
    }

    // If no errors, attempt to post picture
    if (should_submit) {
      // Set post picture button loading
      this.setState({post_picture_loading: true});

      // Setup data to send to api
      let api_data = new FormData();
      api_data.append('picture', this.state.picture_file);
      api_data.append('title', this.state.title);
      
      if (this.state.caption) {
        api_data.append('caption', this.state.caption);
      }

      // Make api request to post picture, ensure response time
      // is atleast 1 second
      const [response] = await Promise.all([
        apiCall.post('/pictures', api_data),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);

      console.log(response);
    }
  }

  render() {
    return (
      <Form size='large' onSubmit={this.postPicture}>
        <Segment>
          <Header as='h3'>Post picture</Header>
          <input
            name='picture'
            value={this.state.picture}
            onChange={this.handlePictureChange}
            type='file'
            style={{border: 'none', paddingLeft: '2px', width: 'auto', marginBottom: '2px'}}
          />
          {this.state.picture_error &&
            <div className="input-msg left error" style={{marginBottom: '0px'}}>{this.state.picture_error}</div>
          }
          <Form.Field style={{marginTop: '6px'}}>
            <Form.Input
              name='title'
              value={this.state.title}
              onChange={this.handleInputChange}
              onBlur={this.validateTitle}
              error={this.state.title_error ? true : false}
              fluid
              placeholder='Title'
            />
            {this.state.title_error &&
              <div className="input-msg left error">{this.state.title_error}</div>
            }
          </Form.Field>
          <Form.Field>
            <TextArea
              placeholder='Caption (optional)'
              style={{fontFamily: 'lato'}}
            />
          </Form.Field>
          <Button
            size='medium'
            style={{marginTop: '4px'}}
            loading={this.state.post_picture_loading}
          >
            Post picture
          </Button>
        </Segment>
      </Form>
    );
  }
}