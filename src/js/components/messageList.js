'use strict';

var React = require('react/addons');
var $     = require('jquery');
var Router = require('react-router');
var config = require('../config');


var Message = require('./message');

var MessageList = React.createClass({
    mixins: [Router.Navigation,Router.State],
    getInitialState: function () {
      return {
          username: '',
          messages: []
      }  
    },
    componentWillMount: function() {
      var socket = io();
      var self = this;
      
      socket.on('chat message', function(msg){
        var aux = self.state.messages;
        aux.push(msg);
        self.setState({messages: aux});
      });
    },
    renderMessages: function(){
      return this.state.messages.map(function(msg){
          return <Message author={msg.author} content={msg.content} isMe={msg.isMe} type={msg.type} encrypted={msg.encrypted} />;
      });
    },
    render: function() {
        return (
          <div className="message-list">
            {this.renderMessages()}
          </div>
        );
    }
});

module.exports = MessageList;
