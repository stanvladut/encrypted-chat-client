'use strict';

var React = require('react/addons');
var $     = require('jquery');
var Router = require('react-router');
var config = require('../config');

var SecurityPanel = require('./securityPanel');

var Message = React.createClass({
    mixins: [Router.Navigation,Router.State],
    getInitialState: function () {
      return {
        message: ''
      }
    },
    decryptMessage: function() {
      var self = this;

      if (this.props.encrypted) {
        var id = this.props.isMe ? sessionStorage.getItem('userID') : sessionStorage.getItem('interlocutorID');
        var interlocutorKey = this.props.isMe ? sessionStorage.getItem('publicKey') : sessionStorage.getItem('interlocutorKey');
        this.props.content.key = this.props.isMe ? this.props.content.symmetricKeyForMe : this.props.content.symmetricKeyForInterlocutor;

        if (this.props.type === 'text') {
          decryptResources(this.props.content, interlocutorKey, id, sessionStorage.getItem('privateKey'))
            .then(function (decryptedMessage) {
              self.setState({message: decryptedMessage.body});
            });
        } else {
          decryptResources(this.props.content, interlocutorKey, id, sessionStorage.getItem('privateKey'))
            .then(function (decryptedMessage) {
              var blobMessage = new Blob([decryptedMessage.body], {type: decryptedMessage.type});
              var fileURL = URL.createObjectURL(blobMessage);
              var getFileFakeAnchor = React.createElement('a', {
                'href': fileURL,
                'download': decryptedMessage.name
              }, decryptedMessage.name);

              self.setState({message: getFileFakeAnchor});
            });
        }
      }
    },
    loadPlainMessage: function(){
      if (this.props.type === 'text') {
        if (this.props.encrypted) {
          this.setState({message: this.props.content.cipherText});
        } else {
          this.setState({message: this.props.content});
        }
      } else {
        if (this.props.encrypted){
          this.setState({message: this.props.content.cipherText});
        } else {
          var blobMessage = new Blob([this.props.content.content], {type: this.props.content.type});
          var fileURL = URL.createObjectURL(blobMessage);
          var getFileFakeAnchor = React.createElement('a', {
            'href': fileURL,
            'download': this.props.content.name
          }, this.props.content.name);

          this.setState({message: getFileFakeAnchor});
        }
      }
    },
    componentWillMount: function(){
      var self = this;
      var socket = io();

      if ((sessionStorage.getItem('encrypted') === 'true') && this.props.encrypted) {
        this.decryptMessage();
      } else {
        this.loadPlainMessage();
      }

      socket.on('notification', function(notification){
        if (typeof notification.encrypted !== 'undefined') {
          if (!notification.encrypted) {
            self.loadPlainMessage()
          } else {
            self.decryptMessage();
          }
        }
      });
    },
    componentDidMount: function() {
      $(".message-list").scrollTop($(".message-list")[0].scrollHeight);
    },
    lockClick: function() {
      if (sessionStorage.getItem('top-secret') === 'true') {
        this.decryptMessage();
      } else {
        $("body").append('<div id="popup"></div>');
        React.render(<SecurityPanel username={this.state.username} decryptMessage={this.decryptMessage}/>, document.getElementById('popup'));
      }
    },
    render: function() {
        return (
          <div className={"message "+this.props.isMe}>
            <div className="message-author">
              {this.props.isMe ? 'Me' : this.props.author}
            </div>
            <button className={(this.props.encrypted && sessionStorage.getItem('encrypted') != 'true') ? 'lock encrypted': 'lock decrypted'} onClick={this.lockClick}> </button>
            <div className="message-content">
              {this.state.message}
            </div>
          </div>
        );
    }
});

module.exports = Message;
