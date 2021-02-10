'use strict';

var React = require('react/addons');
var $     = require('jquery');
var Router = require('react-router');
var config = require('../config');

var Editor = React.createClass({
    mixins: [Router.Navigation,Router.State],
    getInitialState: function () {
      return {
          message: null,
          username: '',
          file: null,
          encrypted: false
      }  
    },
    componentWillMount: function() {
      this.setState({username: this.props.username});

      var socket = io(),
        self = this;
      socket.on('notification', function(notification){
        if (typeof notification.encrypted !== 'undefined') {
          self.setState({encrypted: notification.encrypted});
        }
      });
    },
    componentDidMount: function() {
      var self = this;
      var type = '';
      var name = '';
      var socket = io();
      $('form').submit(function(e){
        e.preventDefault();
        if (self.state.message != null && self.state.message!= "") {
          if (sessionStorage.getItem('encrypted') === 'true') {
            var resources = {
              userID: sessionStorage.getItem('userID'),
              type: "text",
              data: {
                body: self.state.message
              }
            };
            encryptResources(resources, sessionStorage.getItem('interlocutorKey'), sessionStorage.getItem('privateKey'), sessionStorage.getItem('publicKey'))
              .then(function (encryptedMessage) {
                socket.emit('chat message', {author: self.state.username, content: encryptedMessage, type: 'text', encrypted: true});
              });
          } else {
            socket.emit('chat message', {author: self.state.username, content: self.state.message, type: 'text', encrypted: false});
          }

          $('.editor-message').val('');
          self.setState({message: ''});
        }

        if (self.state.file != null ) {
          var reader = new FileReader(),
            file;
  
          reader.onload = function (e) {
            var resources;

            if (sessionStorage.getItem('encrypted') === 'true') {
              resources = {
                userID: sessionStorage.getItem('userID'),
                type: "file",
                data: {
                  body: e.target.result,
                  name: self.state.file.name,
                  type: self. state.file.type
                }
              };

              encryptResources(resources, sessionStorage.getItem('interlocutorKey'), sessionStorage.getItem('privateKey'), sessionStorage.getItem('publicKey'))
              .then(function (encryptedMessage) {
                socket.emit('chat message', {author: self.state.username, content: encryptedMessage, type: 'file', encrypted: true});
              });
            } else {
              resources = {
                content: e.target.result,
                name: self.state.file.name,
                type: self.state.file.type
              };
            
              socket.emit('chat message', {author: self.state.username, content: resources, encrypted: false, type: 'file'});
            }
          };

          reader.readAsArrayBuffer(self.state.file);
        }
      });
    },
    changeMessage: function(e){
      this.setState({message: e.target.value});
    },
    fileChange: function(e){
      this.setState({file: e.target.files[0]});
    },
    render: function() {
        return (
          <form>
            <textarea placeholder="Enter your message" onChange={this.changeMessage} className="editor-message" />
            <input className="editor-file" type="file" id="file" onChange={this.fileChange} />
            <button type="submit">Send</button>
          </form>
        );
    }
});

module.exports = Editor;
