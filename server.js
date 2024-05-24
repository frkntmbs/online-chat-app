const { createServer } = require('http')
const next = require('next')
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  // Memory store
  const users = [];

  io.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);

    socket.on('join-room', (data) => {
      io.to(data.room).emit('receive-system-event', {
        eventMessage: data.user.userName + ' has joined the room.',
        time: getCurrentTime(),
        type: 'join'
      });

      socket.join(data.room);

      // Add user to memory store
      users.push({
        id: socket.id,
        userName: data.user.userName,
        room: data.room
      });

      console.log('User joined room: ' + data.user.userName + ' ' + data.room);

    });

    socket.on('send-message', (data) => {
      io.to(data.room).emit('receive-message', data);
    });

    socket.on('disconnect', () => {
      // Find user in memory store
      const user = users.find(user => user.id === socket.id);

      // Remove user from memory store and emit system event
      if (user) {
        users.splice(users.indexOf(user), 1);
        io.to(user.room).emit('receive-system-event', {
          eventMessage: user.userName + ' has left the room.',
          time: getCurrentTime(),
          type: 'leave'
        });
      }
    });

  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

function getCurrentTime() {
  const date = new Date();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
