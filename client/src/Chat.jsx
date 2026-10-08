import React, { useState, useEffect, useRef } from "react";
import music from './iphone-sms-tone-original-mp4-5732.mp3'

export const Chat = ({ socket, username, room, setShowChat, darkMode, setDarkMode }) => {

  const [currentMessage, setcurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [roomActivity, setRoomActivity] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);

  const containRef = useRef(null);
  const typingTimerRef = useRef(null);

  const notification = new Audio(music);

  const emojis = [
    "😀", "😂", "😍", "😊", "😎",
    "😢", "😭", "😡", "😱", "🤔",
    "👍", "👎", "👏", "🙏", "❤️",
    "🔥", "🎉", "🥳", "💯", "🤣"
  ];

  const addEmoji = (emoji) => {
    setcurrentMessage((message) => message + emoji);
    setShowEmoji(false);
  };

  const sendMessage = async () => {

    if (currentMessage.trim() !== "") {

      const messageData = {
        id: Math.random(),
        room: room,
        author: username,
        message: currentMessage,
        time:
          (new Date(Date.now()).getHours() % 12 || 12) +
          ":" +
          String(new Date(Date.now()).getMinutes()).padStart(2, "0"),
      };

      await socket.emit("send_message", messageData);

      setMessageList((list) => [...list, messageData]);

      setcurrentMessage("");

      socket.emit("stop_typing", {
        username: username,
        room: room
      });

      clearTimeout(typingTimerRef.current);

      notification.play().catch(() => {});
    }
  };

  const leaveRoom = () => {

    socket.emit("leave_room", {
      username: username,
      room: room
    });

    clearTimeout(typingTimerRef.current);

    setShowChat(false);
  };

  useEffect(() => {

    const handleReceiveMsg = (data) => {
      setMessageList((list) => [...list, data]);

      notification.play().catch(() => {});
    };

    socket.on("receive_message", handleReceiveMsg);

    return () => {
      socket.off("receive_message", handleReceiveMsg);
    };

  }, [socket]);

  useEffect(() => {

    const handleTyping = (data) => {

      if (data.username !== username) {
        setTypingUser(data.username);
      }
    };

    const handleStopTyping = (data) => {

      if (!data || data.username !== username) {
        setTypingUser("");
      }
    };

    socket.on("user_typing", handleTyping);
    socket.on("user_stop_typing", handleStopTyping);

    return () => {
      socket.off("user_typing", handleTyping);
      socket.off("user_stop_typing", handleStopTyping);
    };

  }, [socket, username]);

  useEffect(() => {

    const handleUserJoined = (data) => {

      if (data.username !== username) {

        setRoomActivity((list) => [
          ...list,
          {
            id: Math.random(),
            username: data.username,
            action: "joined"
          }
        ]);
      }
    };

    const handleUserLeft = (data) => {

      if (data.username !== username) {

        setRoomActivity((list) => [
          ...list,
          {
            id: Math.random(),
            username: data.username,
            action: "left"
          }
        ]);
      }
    };

    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);

    return () => {
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
    };

  }, [socket, username]);

  useEffect(() => {

    if (containRef.current) {
      containRef.current.scrollTop =
        containRef.current.scrollHeight;
    }

  }, [messageList, typingUser]);

  useEffect(() => {

    return () => {
      clearTimeout(typingTimerRef.current);
    };

  }, []);

  return (
    <>
      <div className="chat_layout">

        <div className="chat_container">

          <div className="chat_header">

            <div>
              <h1>Welcome, {username} 👋</h1>
              <p>Room: {room}</p>
            </div>

            <div className="room_menu">

              <button
                className="menu_btn"
                onClick={() => setShowMenu(!showMenu)}
              >
                ⋮
              </button>

              {showMenu && (
                <div className="menu_dropdown">

                  <button onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
                  </button>

                  <button onClick={leaveRoom}>
                    🚪 Leave Room
                  </button>

                </div>
              )}

            </div>

          </div>

          <div className="chat_box">

            <div
              className="auto-scrolling-div"
              ref={containRef}
            >

              {typingUser && (
                <div className="typing_indicator">
                  <span className="typing_dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                  {typingUser} is typing...
                </div>
              )}

              {messageList.map((data) => (

                <div
                  key={data.id}
                  className="message_content"
                  id={username === data.author ? "you" : "other"}
                >

                  <div>

                    <div
                      className="msg"
                      id={username === data.author ? "y" : "b"}
                    >
                      <p>{data.message}</p>
                    </div>

                    <div className="msg_detail">
                      <p>{data.author}</p>
                      <p>{data.time}</p>
                    </div>

                  </div>

                </div>

              ))}

            </div>

            <div className="chat_body">

              <button
                className="emoji_btn"
                onClick={() => setShowEmoji(!showEmoji)}
              >
                😊
              </button>

              <input
                value={currentMessage}
                type="text"
                placeholder="Type Your Message"
                onChange={(e) => {

                  const value = e.target.value;

                  setcurrentMessage(value);

                  if (value.trim() !== "") {

                    socket.emit("typing", {
                      username: username,
                      room: room
                    });

                    clearTimeout(typingTimerRef.current);

                    typingTimerRef.current = setTimeout(() => {

                      socket.emit("stop_typing", {
                        username: username,
                        room: room
                      });

                      setTypingUser("");

                    }, 1000);

                  } else {

                    socket.emit("stop_typing", {
                      username: username,
                      room: room
                    });

                    clearTimeout(typingTimerRef.current);
                  }
                }}

                onKeyDown={(e) => {

                  if (e.key === "Enter") {
                    sendMessage();
                  }

                }}
              />

              <button onClick={sendMessage}>
                &#9658;
              </button>

            </div>

            {showEmoji && (
              <div className="emoji_picker">

                {emojis.map((emoji) => (

                  <button
                    key={emoji}
                    onClick={() => addEmoji(emoji)}
                  >
                    {emoji}
                  </button>

                ))}

              </div>
            )}

          </div>

        </div>

        <div className="room_sidebar">

          <div className="sidebar_header">

            <h2>Room Activity</h2>

            <p>Room: {room}</p>

          </div>

          <div className="activity_list">

            {roomActivity.length === 0 && (
              <p className="no_activity">
                No activity yet
              </p>
            )}

            {roomActivity.map((activity) => (

              <div
                key={activity.id}
                className="activity_item"
              >

                <div className="activity_avatar">

                  {activity.username
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <div className="activity_text">

                  <strong>
                    {activity.username}
                  </strong>

                  <span>
                    {activity.action === "joined"
                      ? "joined the chat"
                      : "left the chat"}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>
    </>
  );
};