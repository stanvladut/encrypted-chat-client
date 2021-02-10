'use strict';

var React = require('react/addons');
var $     = require('jquery');
var Router = require('react-router');
var config = require('../config');

var Notification = require ('./notification');
var SecurityPanel = require ('./securityPanel');

var Notification = React.createClass({
    mixins: [Router.Navigation,Router.State],
    getInitialState: function () {
      return {
        notification: '', 
        username: ''
      }  
    },
    componentWillMount: function() {
      this.setState({notification: this.props.notification, username: this.props.username});
    },
    componentDidMount: function() {
      $(".notification-panel-notifications").scrollTop($(".notification-panel-notifications")[0].scrollHeight);
    },
    acceptRequest: function(){
      $('.notification-reject').hide();
      $('.notification-accept').text('Accepted');
      $('.notification-accept').prop('disabled', true);

      var socket = io();
      socket.emit('invitation accepted', this.state.username);
    },
    accept: function() {
      var self = this; 

      if (sessionStorage.getItem('top-secret') === 'false') {
        $("body").append('<div id="popup"></div>');
        React.render(<SecurityPanel username={this.state.username} acceptRequest={this.acceptRequest}/>, document.getElementById('popup'));
      } else  {
        this.acceptRequest();
      }
    },
    reject: function() {
      var socket = io();
      socket.emit('invitation rejected', this.state.username);
    },
    confirm: function(){
      var socket = io();
      socket.emit('activation confirmed', this.state.username);

      $('.notification-confirm').text('Confirmed');
      $('.notification-confirm').prop('disabled', true);
    },
    render: function() {
        if (this.state.notification.type === 'request') {
          return (
            <div className="notification">
              <div className="title">
                {this.state.notification.text}
              </div>
              <button className="notification-accept" onClick={this.accept}>Accept</button>
              <button className="notification-reject" onClick={this.reject}>Reject</button>
            </div>
          );
        } else if (this.state.notification.type === 'confirm') {
          return (
            <div className="notification">
              <div className="title">
                {this.state.notification.text}
              </div>
              <button className="notification-confirm" onClick={this.confirm}>Confirm</button>
            </div>
          );
        } else {
          return (
            <div className="notification">
              <div className="title">
                {this.state.notification.text}
              </div>
            </div>
          );
        }
    }
});

module.exports = Notification;
