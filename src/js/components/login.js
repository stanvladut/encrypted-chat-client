'use strict';

var React = require('react/addons');
var $     = require('jquery');
var Router = require('react-router');
var config = require('../config');
var Link = Router.Link;

var Login = React.createClass({
    mixins: [Router.Navigation],
    getInitialState: function () {
      return {
          username: ''
      }  
    },
    usernameChoosed: function() {
        var socket = io();
        socket.emit('join', this.state.username);
        this.transitionTo('/chat/'+this.state.username);
    },
    onInputChange: function(e) {
        this.setState({username: e.target.value});
    },
    render: function() {
        return (
            <div className="login">
                <div className="login-title">Pick your username</div>
                <input name="username" type="text" id="inputUsername" className="" placeholder="Username" onChange={this.onInputChange} required autofocus />
                <button onClick={this.usernameChoosed}>Choose username</button>
            </div>
        );
    }
});

module.exports = Login;
