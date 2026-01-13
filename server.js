// server.js
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port,turbo: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);

    // 1. THE BRIDGE: Internal endpoint for API routes to trigger sockets
    if (req.method === "POST" && parsedUrl.pathname === "/api/socket/trigger") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const { userId, event, data } = JSON.parse(body);
          
          if (userId && io) {
            io.to(userId).emit(event, data);
            console.log(`📡 Socket emitted to ${userId}: ${event}`);
          }
          
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Socket trigger failed" }));
        }
      });
      return;
    }

    // Handle normal Next.js requests
    await handle(req, res, parsedUrl);
  });

  // 2. Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: "*", 
      methods: ["GET", "POST"],
    },
  });

  // 3. Socket Logic
  io.on("connection", (socket) => {
    socket.on("join-room", (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined their notification room.`);
    });
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> 🔌 Socket.io server running`);
  });
});