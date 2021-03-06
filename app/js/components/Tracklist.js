'use strict';

import React             from 'react';
import _                 from 'lodash';
import cx                from 'classnames';
import HTML5Backend      from 'react-dnd-html5-backend';
import {DragDropContext} from 'react-dnd';

import PlaybackActions   from '../actions/PlaybackActions';
import Track             from './Track';
import DraggableTrack    from './DraggableTrack';
import MiniTrack         from './MiniTrack';
import NoDataBlock       from './NoDataBlock';

const Tracklist = React.createClass({

  propTypes: {
    currentUser: React.PropTypes.object,
    playlist: React.PropTypes.object,
    type: React.PropTypes.string,
    currentTrack: React.PropTypes.object,
    filter: React.PropTypes.string,
    isUpvoted: React.PropTypes.bool,
    isDownvoted: React.PropTypes.bool,
    addToPlaylist: React.PropTypes.func,
    selectTrack: React.PropTypes.func,
    upvoteTrack: React.PropTypes.func,
    downvoteTrack: React.PropTypes.func,
    userCollaborations: React.PropTypes.array,
    removeTrackFromPlaylist: React.PropTypes.func,
    sortAttribute: React.PropTypes.string,
    mini: React.PropTypes.bool,
    draggable: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      currentUser: {},
      playlist: {},
      filter: '',
      sortAttribute: 'createdAt',
      mini: false,
      draggable: false
    };
  },

  componentDidUpdate(prevProps) {
    const hasPlaylist = this.props.type === 'playlist' && this.props.playlist.tracks;
    const isNewPlaylist = !_.isEqual(this.props.playlist, prevProps.playlist);
    const isNewSortAttribute = this.props.sortAttribute !== prevProps.sortAttribute;

    if ( hasPlaylist && (isNewPlaylist || isNewSortAttribute) ) {
      PlaybackActions.sortPlaylist(this.props.sortAttribute);
    }
  },

  filterTracks(tracks, query) {
    const regex = new RegExp(query, 'i');

    return _.filter(tracks, function(track) {
      return regex.test(track.title) || regex.test(track.artist);
    });
  },

  trackIsActive(track) {
    return this.props.currentTrack && this.props.currentTrack.sourceParam === track.sourceParam;
  },

  createTrackElement(track, index) {
    const props = {
      ref: `${track.source}-${track.sourceParam}`,
      type: this.props.type,
      track: track,
      index: index,
      currentUser: this.props.currentUser,
      active: this.trackIsActive(track),
      playlist: this.props.playlist,
      userCollaborations: this.props.userCollaborations,
      removeTrackFromPlaylist: this.props.removeTrackFromPlaylist,
      sortAttribute: this.props.sortAttribute,
      draggable: this.props.draggable,
      key: index
    };
    let element;

    if ( this.props.draggable ) {
      element = (
        <DraggableTrack {...props} />
      );
    } else {
      element = (
        <Track {...props} />
      );
    }

    return element;
  },

  createMiniTrackElement(track, index) {
    return (
      <MiniTrack ref={`${track.source}-${track.sourceParam}`}
                 type={this.props.type}
                 track={track}
                 index={index}
                 currentUser={this.props.currentUser}
                 active={this.trackIsActive(track)}
                 playlist={this.props.playlist}
                 userCollaborations={this.props.userCollaborations}
                 removeTrackFromPlaylist={this.props.removeTrackFromPlaylist}
                 key={index} />
    );
  },

  renderTracks() {
    const filteredTracks = this.filterTracks(this.props.playlist.tracks, this.props.filter);
    let content;

    if ( filteredTracks.length ) {
      content = _.map(filteredTracks, this.props.mini ? this.createMiniTrackElement : this.createTrackElement);
    } else {
      content = (
        <NoDataBlock iconClass="icon-frown-o"
                     heading="No tracks found." />
      );
    }

    return content;
  },

  render() {
    const classes = cx('tracklist', {
      'has-control-bar': this.props.type === 'playlist'
    });

    return (
      <div className={classes}>
        {this.renderTracks()}
      </div>
    );
  }

});

export default DragDropContext(HTML5Backend)(Tracklist);
