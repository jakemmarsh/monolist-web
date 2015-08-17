'use strict';

import React             from 'react/addons';
import {ListenerMixin}   from 'reflux';

import TestHelpers       from '../../utils/testHelpers';
import GroupPage         from '../../app/js/pages/GroupPage';
import GroupActions      from '../../app/js/actions/GroupActions';
import ViewingGroupStore from '../../app/js/stores/ViewingGroupStore';

describe('Page: Group', function() {

  let group = TestHelpers.fixtures.group;

  this.timeout(5000);

  beforeEach(function(done) {
    this.container = document.createElement('div');

    // Should listen to ViewingGroupStore and load group on mount
    sandbox.mock(ListenerMixin).expects('listenTo').once();
    sandbox.mock(GroupActions).expects('open').withArgs(group.slug);

    TestHelpers.testPage('/group/' + group.slug, GroupPage, this.container, (component) => {
      this.page = component;
      sandbox.restore();
      done();
    });
  });

  it('should exist', function(done) {
    Should.exist(this.page.getDOMNode());
    done();
  });

  it('should call _onViewingGroupChange when store is triggered', function(done) {
    sandbox.mock(this.page).expects('_onViewingGroupChange');
    ViewingGroupStore.trigger(null, group);

    done();
  });

  it('should load playlists when a new group is received', function(done) {
    sandbox.mock(GroupActions).expects('loadPlaylists').withArgs(group.id, this.page._onPlaylistsChange);
    sandbox.mock(this.page).expects('_onPlaylistsChange').once();

    this.page._onViewingGroupChange(null, this.group);

    done();
  });

  afterEach(function() {
    if ( this.container ) { React.unmountComponentAtNode(this.container); }
  });

});