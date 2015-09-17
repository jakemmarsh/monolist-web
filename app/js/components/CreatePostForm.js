'use strict';

import React       from 'react/addons';
import _           from 'lodash';
import getUrls     from 'get-urls';
import TextArea    from 'react-textarea-autosize';

import PostAPI     from '../utils/PostAPI';
import PostActions from '../actions/PostActions';
import Track       from './Track';

var CreatePostForm = React.createClass({

  propTypes: {
    currentUser: React.PropTypes.object,
    requiresTrack: React.PropTypes.bool,
    className: React.PropTypes.string,
    group: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      requiresTrack: true
    };
  },

  getInitialState() {
    return {
      body: '',
      track: {}
    };
  },

  buildTrack(source, sourceUrl) {
    let hasTrackError = this.state.error && this.state.error.indexOf('track URL') !== -1;

    PostAPI.getTrackDetails(source, sourceUrl).then((track) => {
      console.log('got details:', track);
      this.setState({
        track: track,
        error: hasTrackError ? null : this.state.error
      });
    });
  },

  checkUrls(urls) {
    let scRegex = new RegExp('soundcloud.com', 'i');
    let ytRegex = new RegExp('youtu\.be|youtube\.com', 'i');
    let bcRegex = new RegExp('bandcamp.com', 'i');
    let source = null;
    let sourceUrl = _.find(urls, (url) => {
      if ( scRegex.test(url) ) {
        source = 'soundcloud';
        return true;
      } else if ( ytRegex.test(url) ) {
        source = 'youtube';
        return true;
      } else if ( bcRegex.test(url) ) {
        source = 'bandcamp';
        return true;
      }
    });

    if ( source && sourceUrl ) {
      this.buildTrack(source, sourceUrl);
    } else {
      this.clearTrack();
    }
  },

  clearTrack() {
    this.setState({ track: {} });
  },

  handleChange(evt) {
    let newVal = evt.target.value;
    let urls = getUrls(newVal);

    this.setState({ body: newVal }, this.checkUrls.bind(null, urls));
  },

  handleSubmit(evt) {
    let post = {
      user: this.props.currentUser,
      body: this.state.body,
      track: !_.isEmpty(this.state.track) ? this.state.track : null,
      comments: [],
      createdAt: new Date(),
      GroupId: this.props.group ? this.props.group.id : null
    };

    evt.preventDefault();

    if ( this.props.requiresTrack && _.isEmpty(this.state.track) ) {
      this.setState({ error: 'You must include a track URL in your post.' });
    } else {
      PostActions.create(post, () => {
        this.setState(this.getInitialState());
      });
    }
  },

  renderTrack() {
    if ( !_.isEmpty(this.state.track) ) {
      return (
        <Track type="post"
               track={this.state.track}
               index={0}
               currentUser={this.props.currentUser} />
      );
    }
  },

  renderError() {
    if ( this.state.error ) {
      return (
        <div className="islet text-center error">
          {this.state.error}
        </div>
      );
    }
  },

  render() {
    let classes = 'create-post';

    if ( this.props.className ) {
      classes = classes + ' ' + this.props.className;
    }

    return (
      <div className={classes}>

        {this.renderError()}

        <form className="table full-width" onSubmit={this.handleSubmit}>
          <div className="td form-container">
            <TextArea ref="textArea"
                      value={this.state.body}
                      placeholder="Share a track..."
                      onChange={this.handleChange}>
            </TextArea>

            {this.renderTrack()}
          </div>

          <div className="td text-right button-container">
            <input ref="submitButton"
                   type="submit"
                   className="btn"
                   value="Post"
                   disabled={this.state.body.length === 0 ? 'true' : ''} />
          </div>
        </form>

      </div>
    );
  }

});

export default CreatePostForm;