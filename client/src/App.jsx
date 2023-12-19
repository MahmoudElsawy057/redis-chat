import { io } from "socket.io-client";
import { useState } from "react";
import Chat from "./Chat";
import "./App.css";

const socket = io.connect("http://localhost:3001");

function App() {
  const [room, setRoom] = useState();
  const [userName, setUserName] = useState();
  const [chatIsShown, setChatIsShown] = useState(false);

  const roomInputChangeHandler = (event) => {
    setRoom(event.target.value);
  };

  const joinRoomHandler = () => {
    if (room) {
      socket.emit("join_room", room);
      setChatIsShown(true);
    }
  };

  // const sendMessage = () => {
  //   socket.emit("send_message", { room, message });
  //   setMessage("");
  // };

  // socket.on("recieve_message", (data) => {
  //   setMessageReceived(data.message);
  // });

  return (
    <div className="app">
      {!chatIsShown ? (
        <div className="joinChatContainer">
          <h3>Join Chat</h3>
          <input
            type="text"
            placeholder="your name"
            onChange={(event) => {
              setUserName(event.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Enter Room ID !"
            onChange={roomInputChangeHandler}
          />
          <button onClick={joinRoomHandler}>Join A Room</button>
        </div>
      ) : (
        <Chat socket={socket} username={userName} room={room} />
      )}
    </div>
  );
}

export default App;
