var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

var user1 = {
  username: '',
  id: '',
  hasRequestSent: false,
  acceptedRequest: false,
  confirmedActivation: false,
  activatedMode: false
};

var user2 = {
  username: '',
  id: '',
  hasRequestSent: false,
  acceptedRequest: false,
  confirmedActivation: false,
  activatedMode: false
};

var encryptedSession = false;

var messages = [];

app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.post("/", function (req, res) {
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/hasKeys', function(req, res){
  if (user1.id === req.query.userID){
    if (user1.publicKey && user1.privateKey) {
      res.send({hasKeys: true, publicKey: user1.publicKey, privateKey: user1.privateKey, salt: user1.salt, iv: user1.iv});
    } else {
      res.send({hasKeys: false});
    }
  } else if (user2.id === req.query.userID) {
    if (user2.publicKey && user2.privateKey) {
      res.send({hasKeys: true, publicKey: user2.publicKey, privateKey: user2.privateKey, salt: user2.salt, iv: user2.iv});
    } else {
      res.send({hasKeys: false});
    }
  }
});

app.get('/js/bundle.js', function(req, res){
  res.sendFile(__dirname + '/js/bundle.js');
});

app.get('/socket.js', function(req, res){
  res.sendFile(__dirname + '/socket.js');
});

app.get('/webcrypto-wrapper.js', function(req, res){
  res.sendFile(__dirname + '/webcrypto-wrapper.js');
});

app.get('/css/main.css', function(req, res){
  res.sendFile(__dirname + '/css/main.css');
});

app.get('/images/lock.png', function(req, res){
  res.sendFile(__dirname + '/images/lock.png');
});

app.get('/images/switch.png', function(req, res){
  res.sendFile(__dirname + '/images/switch.png');
});

io.on('connection', function(socket){
  socket.on("join", function(name){
    if (!user1.id) {
      user1.id = socket.id;
      user1.username = name;
    } else {
      user2.id = socket.id;
      user2.username = name;

      socket.emit('interlocutorID', user1.id);
      socket.broadcast.emit('interlocutorID', user2.id);
    }

    socket.emit('userID', socket.id);
  });

  socket.on('chat message', function(msg){
    console.log(msg);
    msg.isMe = true;
    socket.emit('chat message', msg);
    msg.isMe = false;
    socket.broadcast.emit('chat message', msg);
  });

  socket.on('set keys', function(key){
    if (user1.id === socket.id) {
      user1.publicKey = key.publicKey;
      user1.privateKey = key.privateKey;
      user1.iv = key.iv;
      user1.salt = key.salt;
    } else {
      user2.publicKey = key.publicKey;
      user2.privateKey = key.privateKey;
      user2.iv = key.iv;
      user2.salt = key.salt;
    }
  });

  socket.on('change password', function(key){
    if (user1.id === socket.id) {
      console.log({
        old: user1.privateKey,
        new: key
      });
      user1.privateKey = key;
    } else {
      console.log({
        old: user2.privateKey,
        new: key
      });
      user2.privateKey = key;
    }
  });

  socket.on('invitation accepted', function(username){
    var text = username + " a acceptat invitatia la conversatia criptata. Te rog confirma pentru a incepe!";
    if (user1.id === socket.id) {
      if (!user1.acceptedRequest && !user1.activatedMode) {
        user1.acceptedRequest = true;
        user1.activatedMode = true;
        socket.broadcast.emit('confirm invitation', {text: text, type: 'confirm'});
      }
    } else {
        if (!user2.acceptedRequest && !user2.activatedMode) {  
          user2.acceptedRequest = true;
          user2.activatedMode = true;
          socket.broadcast.emit('confirm invitation', {text: text, type: 'confirm'});
        }
      }
  });

  socket.on('activation confirmed', function(username){
    var text = "Sesiunea criptata a inceput!";
    if (user1.id === socket.id) {
      if (!user1.confirmedActivation && !encryptedSession) {
        user1.confirmedActivation = true;
        encryptedSession = true;
        socket.emit('interlocutor key', user2.publicKey);
        socket.broadcast.emit('interlocutor key', user1.publicKey);
      }
    } else {
      if (!user2.confirmedActivation && !encryptedSession) {
        user2.confirmedActivation = true;
        encryptedSession = true;
        socket.emit('interlocutor key', user1.publicKey);
        socket.broadcast.emit('interlocutor key', user2.publicKey);
      }
    }

    io.emit('notification', {text: text, encrypted: true});
  });

  socket.on('invitation rejected', function(username){
    console.log(username, "rejected");
  });

  socket.on('top-secret active', function(username){
    var text = username + ' doreste inceperea unei conversatii criptate cu tine.';
    if (user1.id === socket.id) {
      if (!user1.hasRequestSent) {
        socket.broadcast.emit('request invitation', {text: text, type: 'request'});
        user1.hasRequestSent = true;
        user1.activatedMode = true;
      }
    } else {
        if (!user2.hasRequestSent) {
        socket.broadcast.emit('request invitation', {text: text, type: 'request'});
        user2.hasRequestSent = true;
        user2.activatedMode = true;
      }
    }
  });

  socket.on('top-secret deactive', function(username){
    var text = "Sesiunea criptata a luat sfarsit";
    if (encryptedSession) {
      if (user1.id === socket.id) {
        io.emit('notification', {text: text, type: 'notification', encrypted:false});
      } else {
        io.emit('notification', {text: text, type: 'notification', encrypted:false});
      }
      user1.activatedMode = false;
      user1.hasRequestSent = false;
      user1.confirmedActivation = false;
      user1.acceptedRequest = false;
      user2.activatedMode = false;
      user2.hasRequestSent = false;
      user2.confirmedActivation = false;
      user2.acceptedRequest = false;
      encryptedSession = false;
    }
  });
});

http.listen(3000, function(e){
});
