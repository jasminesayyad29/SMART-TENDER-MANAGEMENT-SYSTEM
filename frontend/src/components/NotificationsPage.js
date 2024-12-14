import React, { useState } from 'react';
import io from 'socket.io-client';
import Chat from './ChatPage';
import './NotificationsPage.css';

const socket = io.connect("https://smart-tender-management-system.onrender.com");

function NotificationsPage() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  return (
    <>
    <br/>
    <br/><div className="notificationsPageContainer">
      {!showChat ? (
        <div className="notificationsJoinChatContainer">
          <h3 className="notificationsJoinTitle">Join A Live Chat</h3>
          <input
            type="text"
            placeholder="Name..."
            className="notificationsInput"
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Tender ID..."
            className="notificationsInput"
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />
          <button onClick={joinRoom} className="notificationsJoinButton">Join A Room</button>
        

        </div>
      ) : (
        <Chat socket={socket} username={username} room={room} />
      )}
    </div>
     
      <br/>
      <br/>
      <br/>
      <br/></>
  );
}

export default NotificationsPage;
