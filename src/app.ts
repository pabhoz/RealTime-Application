import express from 'express';
const app = express();
const http = require('http');
const server = http.createServer(app);
import { Server } from 'socket.io';
const io = new Server(server);

const path = require('path');
const port = 3000;

// Servidor Web (HTTP)
app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules')));
app.use('/public', express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/views/index.html');
});

// Servidor Websockets (Websockets)
const users: any = {};

io.on('connection', (socket) => {
  
  users[socket.id] = { username: "" };
  io.emit('username-update', users);

  socket.on('username-update', (username: string) => {
    users[socket.id].username = username;
    console.log(users);
    io.emit('username-update', users);
  })

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('user-disconnected', socket.id);
  });

  socket.on('publish-msg', (msg: { author: string, content: string, channel: string }) => {
    if (msg.channel === "all") {
      io.emit('published-msg', msg);
    } else {
      io.to(msg.channel).emit('published-msg', msg);
    }
  });
});

server.listen(port, () => {
  return console.log(`server is listening on http://localhost:${port}`);
});
