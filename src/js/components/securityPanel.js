'use strict';

var React = require('react/addons');
var $     = require('jquery');
var Router = require('react-router');
var config = require('../config');

var SecurityPanel = React.createClass({
    mixins: [Router.Navigation, Router.State],
    getInitialState: function () {
      return {
        username: '',
        top_secret: false
      }  
    },
    closePanel: function() {
        React.unmountComponentAtNode(document.getElementById('popup'));
        $('#popup').remove();
    },
    componentWillMount: function() {
      this.setState({username: this.props.username});
      $('.change-password').hide();
    },
    componentDidMount: function(){
      if (sessionStorage.getItem('top-secret') === 'true') {
        $(".top-secret-switch").prop('checked', true);
        $('.change-password').hide();
      } else {
        $(".top-secret-switch").prop('checked', false);
        $('.change-password').show();
      }
    },
    switchMode: function(e) {
      var socket = io();
      var masterPassword = $('.top-secret-password').val();

      sessionStorage.setItem('top-secret', e.target.checked);

      var RSAProperties = config.RSAProperties;
      var PBKDF2Properties = config.PBKDF2Properties;
      var AESProperties = config.AESProperties;

      PBKDF2Properties.masterPassword = masterPassword;
      AESProperties.additionalData = sessionStorage.getItem('userID');

      if (e.target.checked) {
        var self = this;

        $.get( "/hasKeys", {userID: sessionStorage.getItem('userID')})
          .done(function(data) {
            if (!data.hasKeys) {
              createNewEnvironment(RSAProperties, PBKDF2Properties, AESProperties)
              .then(function(result){
                PBKDF2Properties.salt = result.salt;
                AESProperties.iv = result.iv;
                AESProperties.data = result.encryptedPrivateKey;

                sessionStorage.setItem('publicKey', result.publicKey);
                socket.emit('set keys', {publicKey: result.publicKey, privateKey: result.encryptedPrivateKey, salt: result.salt, iv: result.iv});

                setEnvironment(PBKDF2Properties, AESProperties)
                  .then(function(result2){
                    sessionStorage.setItem('privateKey', result2.decryptedRSAPrivateKey);
                  });
              })
              .catch(function(err){
                console.log(err);
              });
            } else {
              sessionStorage.setItem('publicKey', data.publicKey);

              PBKDF2Properties.salt = data.salt;
              AESProperties.iv = data.iv;
              AESProperties.data = data.privateKey;

              setEnvironment(PBKDF2Properties, AESProperties)
              .then(function(result){
                sessionStorage.setItem('privateKey', result.decryptedRSAPrivateKey);

                if (self.props.decryptMessage) {
                  self.props.decryptMessage();
                  self.closePanel();
                }
              })
              .catch(function(err){
                console.log(err);
              });
            }
          });

        $('.top-secret-password').hide();
      } else {
        sessionStorage.setItem('privateKey', null);
        $('.top-secret-password').show();
      }

      if (!this.props.acceptRequest && !this.props.decryptMessage) {
        if (e.target.checked) {
          socket.emit('top-secret active', this.state.username);
        } else {
          socket.emit('top-secret deactive', this.state.username);
        }
      } else {
        if(this.props.acceptRequest) {
          if (e.target.checked) {
            this.props.acceptRequest();
            this.closePanel();
          }
        }
      }
    },
    changePassword: function(){
      var oldPass =  $('.old-password').val(),
        newPass = $('.new-password').val();

      var socket = io();

      $.get( "/hasKeys", {userID: sessionStorage.getItem('userID')})
        .done(function(data){
          if (data.hasKeys) {
            var PBKDF2Properties = config.PBKDF2Properties;
            var AESProperties = config.AESProperties;

            PBKDF2Properties.masterPassword = oldPass;
            AESProperties.additionalData = sessionStorage.getItem('userID');
            PBKDF2Properties.salt = data.salt;
            AESProperties.iv = data.iv;
            AESProperties.data = data.privateKey;

            changeMasterPassword(PBKDF2Properties, AESProperties, newPass)
            .then(function(result){
              socket.emit('change password', result.newKey);
              alert("Password changed!")
            })
            .catch(function(err){
              console.log(err);
            });
          }
        });
    },
    render: function() {
        return (
          <div className="security-panel">
            <button className="button-close" onClick={this.closePanel}>x</button>
            <div className="top-secret">
              <div className="top-secret-title">Activare mod Top-Secret</div>
              <input placeholder="Master Password" type="password" className="top-secret-password" />
              <input type="checkbox" className="top-secret-switch" onChange={this.switchMode} />
            </div>

            <div className="change-password">
              <div className="change-password-title">Schimbarea parolei secrete</div>
              <input className="old-password" placeholder="Parola cea veche" type="password"/>
              <input className="new-password" placeholder="Parola cea noua" type="password"/>
              <button onClick={this.changePassword}>Change password</button>
            </div>
          </div>
        );
    }
});

module.exports = SecurityPanel;