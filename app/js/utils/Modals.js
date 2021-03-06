'use strict';

import React               from 'react';
import _                   from 'lodash';

import APIUtils            from './APIUtils';
import GlobalActions       from '../actions/GlobalActions';
import UserSearchForm      from '../components/UserSearchForm';
import AddTrackFromUrlForm from '../components/AddTrackFromUrlForm';
import EditGroupForm       from '../components/EditGroupForm';
import EditPlaylistForm    from '../components/EditPlaylistForm';
import ConfirmationModal   from '../components/ConfirmationModal';
import LoginForm           from '../components/LoginForm';
import ShareModal          from '../components/ShareModal';
import FlashWarningModal   from '../components/FlashWarningModal';
import TrackLoadErrorModal from '../components/TrackLoadErrorModal';

const Modals = {
  openUserSearch(initialResults, currentUser, selectUser, deselectUser, isUserSelected) {
    initialResults = _.reject(initialResults || [], user => {
      return user.id === currentUser.id;
    });

    GlobalActions.openModal('user-search',
      <UserSearchForm currentUser={currentUser}
                      selectUser={selectUser}
                      deselectUser={deselectUser}
                      isUserSelected={isUserSelected}
                      initialResults={initialResults} />
    );
  },

  openAddTrackByUrl(playlist, currentUser) {
    GlobalActions.openModal('add-track-from-url',
      <AddTrackFromUrlForm currentUser={currentUser} playlist={playlist} />
    );
  },

  openEditGroup(group) {
    GlobalActions.openModal('edit-group',
      <EditGroupForm group={group} />
    );
  },

  openEditPlaylist(playlist) {
    GlobalActions.openModal('edit-playlist',
      <EditPlaylistForm playlist={playlist} />
    );
  },

  openShare(playlist) {
    GlobalActions.openModal('share',
      <ShareModal playlist={playlist} />
    );
  },

  openConfirmation(prompt, cb) {
    GlobalActions.openModal('confirmation',
      <ConfirmationModal prompt={prompt} cb={cb} />
    );
  },

  openLogin() {
    GlobalActions.openModal('login',
      <LoginForm onLogin={GlobalActions.closeModal} />
    );
  },

  openFlashError() {
    GlobalActions.openModal('flash-warning error',
      <FlashWarningModal />
    );
  },

  openYouTubeError(errorNum, track, playlist, currentUser) {
    let message;

    switch ( errorNum ) {
      case 100:
        message = 'Unfortunately, it looks like that video no longer exists.';
        break;
      case 101:
      case 150:
        message = 'Unfortunately, the video uploader has disabled viewing of that video outside of YouTube.com.';
        break;
      default:
        message = 'Something went wrong trying to play that video.';
        break;
    }

    GlobalActions.openModal('youtube-error error',
      <TrackLoadErrorModal title="That video could not be played"
                           message={message}
                           currentTrack={track}
                           currentPlaylist={playlist}
                           currentUser={currentUser} />
    );
  },

  openAudioPlayerError(track, playlist, currentUser) {
    const source = APIUtils.humanizeTrackSource(track.source);
    const message = `Unfortunately, it looks like we are not currently able to stream that track from
                     ${source}. This could be a temporary glitch, or it could mean the uploader has removed
                     or restricted access to the track.`;

    GlobalActions.openModal('audio-player-error error',
      <TrackLoadErrorModal title="That track could not be played"
                           message={message}
                           currentTrack={track}
                           currentPlaylist={playlist}
                           currentUser={currentUser} />
    );
  }

};

export default Modals;
