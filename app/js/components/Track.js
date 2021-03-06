'use strict';

import React              from 'react';
import _                  from 'lodash';
import {Link}             from 'react-router';
import cx                 from 'classnames';

import Helpers            from '../utils/Helpers';
import PermissionsHelpers from '../utils/PermissionsHelpers';
import PlaylistActions    from '../actions/PlaylistActions';
import TrackActions       from '../actions/TrackActions';
import GlobalActions      from '../actions/GlobalActions';
import CommentList        from './CommentList';

const Track = React.createClass({

  propTypes: {
    currentUser: React.PropTypes.object,
    track: React.PropTypes.object,
    index: React.PropTypes.number,
    playlist: React.PropTypes.object,
    type: React.PropTypes.string,
    active: React.PropTypes.bool,
    className: React.PropTypes.string,
    userCollaborations: React.PropTypes.array,
    removeTrackFromPlaylist: React.PropTypes.func,
    sortAttribute: React.PropTypes.string.isRequired,
    draggable: React.PropTypes.bool,
    highlightTop: React.PropTypes.bool,
    highlightBottom: React.PropTypes.bool,
    playable: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      currentUser: {},
      track: {},
      playlist: {},
      active: false,
      draggable: false,
      userCollaborations: [],
      playable: true
    };
  },

  getInitialState() {
    return {
      displayComments: false
    };
  },

  isUpvoted() {
    return _.some(this.props.track.upvotes, { userId: this.props.currentUser.id });
  },

  isDownvoted() {
    return _.some(this.props.track.downvotes, { userId: this.props.currentUser.id });
  },

  getScore() {
    const { track } = this.props;
    const hasUpvotesAndDownvotes = track.downvotes && track.upvotes;

    return hasUpvotesAndDownvotes ? track.upvotes.length - track.downvotes.length : 0;
  },

  stopPropagation(evt) {
    evt.stopPropagation();
  },

  toggleCommentDisplay(evt) {
    evt.stopPropagation();

    this.setState({
      displayComments: !this.state.displayComments
    });
  },

  selectTrack() {
    if ( this.props.playable ) {
      PlaylistActions.play(
        this.props.playlist,
        TrackActions.select.bind(null, this.props.track, this.props.index, () => {})
      );
    }
  },

  upvote(evt) {
    evt.stopPropagation();

    TrackActions.upvote.bind(this.props.track);
  },

  downvote(evt) {
    evt.stopPropagation();

    TrackActions.downvote(this.props.track);
  },

  showContextMenu(evt) {
    const menuItems = (
      <div>
        {this.renderStarTrackOption()}
        {this.renderAddTrackOption()}
        {this.renderGotoSourceOption()}
        {this.renderDeleteOption()}
      </div>
    );

    if ( evt ) {
      evt.stopPropagation();
      evt.preventDefault();
    }

    GlobalActions.openContextMenu(menuItems, evt.pageX, evt.pageY);
  },

  postComment(body, cb = () => {}) {
    TrackActions.addComment(body, this.props.track, cb);
  },

  deleteComment(commentId, cb = () => {}) {
    TrackActions.removeComment(this.props.track.id, commentId, cb);
  },

  renderPossiblePlaylists() {
    return _.map(this.props.userCollaborations, (playlist, index) => {
      return (
        <li className="menu-item"
            key={index}
            onClick={PlaylistActions.addTrack.bind(null, playlist, this.props.track, () => {})}>
          {playlist.title}
        </li>
      );
    });
  },

  renderStarTrackOption() {
    const userHasStarred = !_.isEmpty(this.props.currentUser) && _.some(this.props.currentUser.starredTracks, {
      sourceParam: this.props.track.sourceParam,
      sourceUrl: this.props.track.sourceUrl
    });
    const iconClass = 'fa ' + (userHasStarred ? 'icon-star-o' : 'icon-star');
    const text = userHasStarred ? 'Unstar Track' : 'Star Track';
    const func = userHasStarred ? TrackActions.unstar : TrackActions.star;

    if ( !_.isEmpty(this.props.currentUser) ) {
      return (
        <li className="menu-item" onClick={func.bind(null, this.props.track, () => {})}>
          <i className={iconClass} />
          {text}
        </li>
      );
    }
  },

  renderAddTrackOption() {
    if ( !_.isEmpty(this.props.currentUser) && !!this.props.userCollaborations.length ) {
      return (
        <li className="menu-item">
          <i className="icon-plus" />
          Add Track To Playlist
          <i className="icon-chevron-right float-right flush--right" />
          <ul>
            {this.renderPossiblePlaylists(this.props.userCollaborations, this.props.track)}
          </ul>
        </li>
      );
    }
  },

  renderGotoSourceOption() {
    return (
      <li className="menu-item">
        <i className="icon-external-link" />
        Go to Source
        <a href={this.props.track.sourceUrl} target="_blank" />
      </li>
    );
  },

  renderDeleteOption() {
    const userIsCollaborator = PermissionsHelpers.isUserPlaylistCollaborator(this.props.playlist, this.props.currentUser);

    if ( this.props.type === 'playlist' && this.props.removeTrackFromPlaylist && userIsCollaborator ) {
      return (
        <li className="menu-item" onClick={this.props.removeTrackFromPlaylist.bind(null, this.props.track)}>
          <i className="icon-close"></i>
          Delete Track
        </li>
      );
    }
  },

  renderArtwork() {
    let artworkStyle;

    if ( this.props.track.imageUrl ) {
      artworkStyle = {
        'backgroundImage': 'url(' + this.props.track.imageUrl + ')'
      };

      return (
        <div className="artwork-container">
          <div className="artwork" style={artworkStyle} />
        </div>
      );
    }
  },

  renderDuration() {
    if ( this.props.track.duration ) {
      return (
        <span className="duration">{Helpers.formatSecondsAsTime(this.props.track.duration)}</span>
      );
    }
  },

  renderCollaboratorOptions() {
    const userIsCreator = PermissionsHelpers.isUserPlaylistCreator(this.props.playlist, this.props.currentUser);
    const userIsCollaborator = PermissionsHelpers.isUserPlaylistCollaborator(this.props.playlist, this.props.currentUser);
    const scoreClasses = cx('score', {
      'upvoted': this.isUpvoted(),
      'downvoted': this.isDownvoted()
    });
    const upvoteClasses = cx('icon-chevron-up', 'upvote', {
      'active': this.isUpvoted()
    });
    const downvoteClasses = cx('icon-chevron-down', 'downvote', {
      'active': this.isDownvoted()
    });

    if ( this.props.type === 'playlist' && (userIsCreator || userIsCollaborator) ) {
      return (
        <div className="upvote-downvote-container">
          <span className={scoreClasses}>{this.getScore()}</span>
          <i ref="upvote" className={upvoteClasses} onClick={this.upvote} />
          <i ref="downvote" className={downvoteClasses} onClick={this.downvote} />
        </div>
      );
    }
  },

  renderTrackCreator() {
    if ( this.props.type === 'playlist' && this.props.track.user ) {
      return (
        <div className="added-by-container">
          added by <Link to={`/profile/${this.props.track.user.username}`} onClick={this.stopPropagation}>{this.props.track.user.username}</Link>
        </div>
      );
    }
  },

  renderDragIcon() {
    if ( this.props.draggable && PermissionsHelpers.isUserPlaylistCollaborator(this.props.playlist, this.props.currentUser) ) {
      return (
        <div className="track-drag-icon-container soft-quarter--left soft-half--right text-right">
          <i className="track-drag-icon icon-bars" />
        </div>
      );
    }
  },

  renderToggleCommentDisplay() {
    const userIsCreator = PermissionsHelpers.isUserPlaylistCreator(this.props.playlist, this.props.currentUser);
    const userIsCollaborator = PermissionsHelpers.isUserPlaylistCollaborator(this.props.playlist, this.props.currentUser);
    const numComments = this.props.track && this.props.track.comments ? this.props.track.comments.length : 0;
    const spanString = this.state.displayComments ? 'Hide Comments' : `Show Comments (${numComments})`;

    if ( this.props.type === 'playlist' && (userIsCreator || userIsCollaborator) ) {
      return (
        <a ref="commentToggle" className="inline-block nudge-quarter--top" onClick={this.toggleCommentDisplay}>{spanString}</a>
      );
    }
  },

  renderCommentList() {
    const userIsCreator = PermissionsHelpers.isUserPlaylistCreator(this.props.playlist, this.props.currentUser);
    const userIsCollaborator = PermissionsHelpers.isUserPlaylistCollaborator(this.props.playlist, this.props.currentUser);

    if( this.props.type === 'playlist' && (userIsCreator || userIsCollaborator) ) {
      return (
        <CommentList ref="commentList"
                     currentUser={this.props.currentUser}
                     postComment={this.postComment}
                     deleteComment={this.deleteComment}
                     comments={this.props.track.comments}
                     shouldDisplay={this.state.displayComments} />
      );
    }
  },

  render() {
    const classes = cx('track', this.props.track.source, {
      active: this.props.active,
      'highlight-top': this.props.highlightTop,
      'highlight-bottom': this.props.highlightBottom,
      'unplayable': !this.props.playable,
      [this.props.className]: !!this.props.className
    });

    return (
      <div className={classes} onClick={this.selectTrack}>

        <div className="track-info-container">
          <div className="dropdown-icon-container">
            <i className="icon-ellipsis-h" onClick={this.showContextMenu} />
          </div>
          {this.renderArtwork()}
          <div className="info-container">
            <h5 className="title">{this.props.track.title} {this.renderDuration()}</h5>
            <h6 className="artist">{this.props.track.artist}</h6>
            {this.renderToggleCommentDisplay()}
          </div>
          <div className="options-container">
            {/*this.renderCollaboratorOptions()*/}
            {this.renderTrackCreator()}
          </div>
          {this.renderDragIcon()}
        </div>

        {this.renderCommentList()}

      </div>
    );
  }

});

export default Track;
