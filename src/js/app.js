'use strict';

var React = require('react/addons');
var Router = require('react-router');
var config = require('./config');

var cookie = require('react-cookie');
var $ = require('jquery');

var App = React.createClass({
	componentWillMount: function(){
		sessionStorage.setItem('top-secret', false);
		sessionStorage.setItem('encrypted', false);
		sessionStorage.setItem('userID', null);
		sessionStorage.setItem('interlocutorID', null);
		sessionStorage.setItem('interlocutorKey', null);

		var socket = io();
		socket.on('userID', function(userID){
			sessionStorage.setItem('userID', userID);
			console.log("userID", userID);
		});

		socket.on('interlocutor key', function(interlocutorKey){
			sessionStorage.setItem('interlocutorKey', interlocutorKey);
		});

		socket.on('interlocutorID', function(interlocutorID){
			sessionStorage.setItem('interlocutorID', interlocutorID);
			console.log("iID", interlocutorID);
		});
	},
	render: function() {
		return (
			<Router.RouteHandler {...this.state} />
		);
	}
});

module.exports = App;

