/**
 * @jsx React.DOM
 */
'use strict';

var React  = require('react/addons');
var Link   = require('react-router').Link;
var moment = require('moment');

var Avatar = require('./Avatar');

var Comment = React.createClass({

  propTypes: {
    comment: React.PropTypes.object.isRequired
  },

  render: function() {
    return (
        <li className="comment">
          <div className="avatar-container">
            <Avatar user={this.props.comment.author} />
          </div>
          <div className="body-container">
            <div className="author">
              <Link to="Profile" params={{username: this.props.comment.author}}>{this.props.comment.author}</Link>
            </div>
            <div className="body">
              {this.props.comment.body}
            </div>
            <span className="timestamp">{moment(this.props.comment.timestamp).fromNow()}</span>
          </div>
        </li>
    );
  }

});

module.exports = React.createFactory(Comment);