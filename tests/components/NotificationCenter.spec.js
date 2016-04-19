'use strict';

import TestUtils          from 'react-addons-test-utils';

import TestHelpers        from '../../utils/testHelpers';
import GlobalActions      from '../../app/js/actions/GlobalActions';
import NotificationCenter from '../../app/js/components/NotificationCenter';
import NotificationsStore from '../../app/js/stores/NotificationsStore';

describe('Component: NotificationCenter', function() {

  const user = TestHelpers.fixtures.user;

  it('#_onNotificationsChange should clear interval and set error state on error', function() {
    const center = TestHelpers.renderStubbedComponent(NotificationCenter, { currentUser: user });
    const err = {
      message: 'Test error'
    };

    sandbox.mock(window).expects('clearInterval').withArgs(center.interval);
    sandbox.mock(center).expects('setState').withArgs({ error: err });

    center._onNotificationsChange(err, []);
  });

  it('#_onNotificationsChange should correctly set the state if no error', function() {
    const center = TestHelpers.renderStubbedComponent(NotificationCenter, {});
    const newNotifications = [{ id: 3 }, { id: 5 }];

    sandbox.mock(center).expects('setState').once().withArgs({
      notifications: newNotifications,
      error: null
    });

    center._onNotificationsChange(null, newNotifications);
  });

  it('#componentDidUpdate should clear interval if new user is empty', function() {
    const center = TestHelpers.renderStubbedComponent(NotificationCenter, { currentUser: user });

    sandbox.mock(window).expects('clearInterval').withArgs(center.interval);

    center.componentDidUpdate({ currentUser: {} });
  });

  it('#componentDidUpdate should retrieve notifications if a new user is received', function() {
    const center = TestHelpers.renderStubbedComponent(NotificationCenter, { currentUser: user });

    sandbox.mock(GlobalActions).expects('loadUserNotifications').once();

    center.componentDidUpdate({ currentUser: { id: 3 } });
  });

  it('#componentDidMount should listen to the notifications store, load notifications, and set the check interval', function() {
    const center = TestHelpers.renderStubbedComponent(NotificationCenter, {});

    sandbox.mock(center).expects('listenTo').once().withArgs(NotificationsStore, center._onNotificationsChange);
    sandbox.mock(GlobalActions).expects('loadUserNotifications');

    center.componentDidMount();

    Should(center.interval).not.be.undefined();
  });

  it('#componentWillUnmount should clear the check interval and turn off document click listener', function() {
    const center = TestHelpers.renderStubbedComponent(NotificationCenter, {});

    window.clearInterval = sandbox.stub();
    sandbox.mock(document).expects('removeEventListener').withArgs('click', center.toggleDropdown);

    center.componentWillUnmount();
    sinon.assert.calledWith(window.clearInterval, center.interval);
  });

  it('#toggleDropdown should flip this.state.showDropdown and add a click listener to DOM if true', function() {
    const center = TestHelpers.renderStubbedComponent(NotificationCenter, {});

    sandbox.mock(document).expects('addEventListener').withArgs('click', center.toggleDropdown);
    sandbox.mock(center).expects('setState').withArgs({
      showDropdown: true
    });

    center.toggleDropdown(TestHelpers.createNativeClickEvent());
  });

  it('#toggleDropdown should flip this.state.showDropdown and remove a click listener from DOM if false', function() {
    const center = TestHelpers.renderStubbedComponent(NotificationCenter, {});

    center.setState({ showDropdown: true });
    sandbox.mock(document).expects('removeEventListener').withArgs('click', center.toggleDropdown);
    sandbox.mock(center).expects('setState').withArgs({
      showDropdown: false
    });

    center.toggleDropdown(TestHelpers.createNativeClickEvent());
  });

  it('#getNumNew should return the number of notifications where `read` is false', function() {
    const center = TestHelpers.renderStubbedComponent(NotificationCenter, {});
    const notifications = [{ read: false }, { read: false }, { read: true }];

    center.setState({ notifications: notifications });

    center.getNumNew().should.eql(2);
  });

  it('#markAsRead should call the read action with the specific notification', function() {
    const center = TestHelpers.renderStubbedComponent(NotificationCenter, {});
    const notification = { id: 1 };

    sandbox.mock(GlobalActions).expects('markNotificationsAsRead').once().withArgs(notification.id);

    center.markAsRead(notification);
  });

  it('#markAllAsRead should pluck the IDs from all notifications and call the read action', function() {
    const center = TestHelpers.renderStubbedComponent(NotificationCenter, {});
    const notifications = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const ids = [1, 2, 3];

    center.setState({ notifications: notifications });
    sandbox.mock(GlobalActions).expects('markNotificationsAsRead').withArgs(ids);

    center.markAllAsRead(TestHelpers.createNativeClickEvent());
  });

  it('#renderDropdown should only return an element if there is a currentUser and state.showDropdown is true', function() {
    const center = TestHelpers.renderStubbedComponent(NotificationCenter, { currentUser: user });

    Should(center.renderDropdown()).be.undefined();

    center.setState({ showDropdown: true });
    Should(center.renderDropdown()).not.be.undefined();
  });

  it('clicking the toggle should call #toggleDropdown', function() {
    const center = TestHelpers.renderStubbedComponent(NotificationCenter, {});
    const toggle = center.refs.notificationsToggle;

    sandbox.mock(center).expects('toggleDropdown').once();

    TestUtils.Simulate.click(toggle);
  });

});