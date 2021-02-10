'use strict';

var React = require('react/addons');
var $     = require('jquery');
var Router = require('react-router');
var config = require('../config');

var MessageList = require("./messageList");
var Editor = require("./editor");

var Conversation = React.createClass({
    mixins: [Router.Navigation,Router.State],
    getInitialState: function () {
      return {
          username: ''
      }  
    },
    componentWillMount: function() {
      this.setState({username: this.props.username});
    },
    render: function() {
        return (
          <div className='conversation'>
            <MessageList />
            <Editor username={this.props.username}/>
          </div>
        );
    }
});

module.exports = Conversation;
