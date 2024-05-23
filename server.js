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

  io.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);

    socket.on('join-room', (data) => {
      socket.join(data.id);
      console.log('User joined room: ' + data.user.userName);
    });

    socket.on('send-message', (data) => {
      io.to(data.id).emit('receive-message', data);
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