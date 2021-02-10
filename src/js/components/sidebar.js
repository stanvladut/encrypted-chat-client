'use strict';

var React = require('react/addons');
var $     = require('jquery');
var Router = require('react-router');
var config = require('../config');

var SecurityPanel = require('./securityPanel');

var Sidebar = React.createClass({
    mixins: [Router.Navigation,Router.State],
    getInitialState: function () {
      return {
        username: ''
      }  
    },
    componentWillMount: function(){
      this.setState({username: this.props.username});
    },
    componentDidMount: function() {
      var self = this; 
      $('#security').on('click', function(){
        $("body").append('<div id="popup"></div>');
        React.render(<SecurityPanel username={self.state.username}/>, document.getElementById('popup'));
      });
    },
    render: function() {
        return (
          <div className="sidebar">
            <div className="sidebar-title">Panoul de control</div>
            <ul>
              <li id="security">Security Panel</li>
            </ul>
          </div>
        );
    }
});

module.exports = Sidebar;
