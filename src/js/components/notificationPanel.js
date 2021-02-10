'use strict';

var React = require('react/addons');
var $     = require('jquery');
var Router = require('react-router');
var config = require('../config');

var Notification = require ('./notification');

var NotificationPanel = React.createClass({
    mixins: [Router.Navigation,Router.State],
    getInitialState: function () {
      return {
          notifications: [],
          username: ''
      }  
    },
    componentWillMount: function() {
      this.setState({username: this.props.username});
    },
    componentDidMount: function() {
      var socket = io();
      var self = this;
      
      socket.on('request invitation', function(notification){
        console.log(notification);
        var aux = self.state.notifications;
        aux.push(notification);
        self.setState({notification: notification});
      });

      socket.on('confirm invitation', function(notification){
        console.log(notification);
        var aux = self.state.notifications;
        aux.push(notification);
        self.setState({notification: notification});
      });

      socket.on('notification', function(notification){
        console.log(notification);
        var aux = self.state.notifications;
        aux.push(notification);
        self.setState({notification: notification});
        if (typeof notification.encrypted !== 'undefined') {
          sessionStorage.setItem('encrypted', notification.encrypted);
        }
      });
    },
    renderNotifications: function() {
      var self = this; 
      return this.state.notifications.map(function(notification){
        return <Notification username={self.state.username} notification={notification} />
      });
    },
    render: function() {
        return (
          <div className="notification-panel">
            <div className="notification-panel-title">Panoul de notificari</div>
            <div className="notification-panel-notifications">
              {this.renderNotifications()}
            </div>
          </div>
        );
    }
});

module.exports = NotificationPanel;
