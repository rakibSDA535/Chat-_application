const PORT = process.env.PORT || 3000;
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
console.log(`Server running on port ${PORT}`);
app.use(express.static(__dirname));
const users = {};
io.on("connection", (socket) => {
  socket.on("new-user-joined", (names) => {
    users[socket.id] = names;
    socket.broadcast.emit("user-joined", names);
  });
  socket.on("file-send", (data) => {
    socket.broadcast.emit("file-receive", {
      fileData: data.fileData,
      fileName: data.fileName,
      fileType: data.fileType,
      names: users[socket.id],
      timestamp: data.timestamp,
    });
  });
  socket.on("send", (data) => {
    socket.broadcast.emit("receive", {
      message: data.message,
      names: users[socket.id],
      timestamp: data.timestamp,
    });
  });
  socket.on("disconnect", () => {
    const disconnectedUser = users[socket.id];
    if (disconnectedUser) {
      socket.broadcast.emit("left", disconnectedUser);
      delete users[socket.id];
    }
  });
});
http.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
