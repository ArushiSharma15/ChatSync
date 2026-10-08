import React, { useState } from 'react'
import io from 'socket.io-client'
import { Chat } from './Chat'
import music from './mixkit-tile-game-reveal-960.wav';

const socket = io.connect("http://localhost:1000")

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
});

socket.on("connect_error", (error) => {
  console.log("Connection error:", error.message);
});

const App = () => {

  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const notification = new Audio(music);

  const joinChat = () => {

    if (username.trim() !== "" && room.trim() !== "") {

      console.log("Joining room:", {
        username: username,
        room: room
      });

      socket.emit("join_room", {
        username: username,
        room: room
      });

      setShowChat(true);

      notification.play().catch(() => {});
    }
  };

  return (

    <div className={darkMode ? "app dark_mode" : "app light_mode"}>

      {!showChat && (
        <button
          className="theme_toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      )}

      {!showChat && (

        <div className="join_room">

          <h1>💬 ChatSync</h1>

          <p>
            Real-time communication made simple
          </p>

          <input
            type="text"
            placeholder="Enter Your Name"
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="text"
            placeholder="Enter Chat Room"
            onChange={(e) => setRoom(e.target.value)}
          />

          <button onClick={joinChat}>
            Join Chat
          </button>

        </div>

      )}

      {showChat && (

        <Chat
          socket={socket}
          username={username}
          room={room}
          setShowChat={setShowChat}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

      )}

    </div>
  );
}

export default App