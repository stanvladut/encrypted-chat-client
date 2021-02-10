'use strict';

var React  = require('react/addons');
var Router = require('react-router');

var Route        = Router.Route;
var DefaultRoute = Router.DefaultRoute;

var App = require('./app');
var Chat = require('./components/chat');
var Login = require('./components/login');

module.exports = (
	<Route name="app" path="/" handler={App}>
	    <Route name="login" path="/login" handler={Login}/>
	    <Route name="chat" path="/chat/:username" handler={Chat}/>
	    <DefaultRoute handler={Login}/>
	</Route>
);

