/**
 * @jsx React.DOM
 */
'use strict';

var React        = require('react/addons');
var transitionTo = require('react-router').transitionTo;

var HomePage = React.createClass({

  getDefaultProps: function() {
    return {
      user: {}
    };
  },

  componentWillMount: function() {
    if ( this.props.user ) {
      transitionTo('Explore');
    }
  },

  componentDidMount: function() {
    this.props.updateHeader({
      title: null,
      icon: null
    });
  },

  render: function() {
    return (
      <section className="content home">

        Home page only visible when not logged in

      </section>
    );
  }

});

module.exports = HomePage;