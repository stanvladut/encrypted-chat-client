'use strict';

var React = require('react/addons');
var $     = require('jquery');
var Router = require('react-router');
var config = require('../config');

var Conversation = require("./conversation");
var NotificationPanel = require("./notificationPanel");
var Sidebar = require("./sidebar");

var Chat = React.createClass({
    mixins: [Router.Navigation,Router.State],
    getInitialState: function () {
      return {
          username: ''
      }  
    },
    componentWillMount: function() {
      this.setState({username: this.getParams().username});
    },
    render: function() {
        return (
          <div className='page'>
            <Sidebar username={this.state.username}/>
            <Conversation username={this.state.username} />
            <NotificationPanel username={this.state.username}/>
          </div>
        );
    }
});

module.exports = Chat;
