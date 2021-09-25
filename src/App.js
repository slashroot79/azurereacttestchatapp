
import './App.css';
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button, Card, Form, Container} from 'react-bootstrap'
import axios from 'axios'

// {"host":req.headers.host, "method":req.method, "requrl":req.url, "statuscode":res.statusCode, "body":req.body }

const SERVER_ENDPOINT = "http://localhost:4000";
let socket;


function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [room, setRoom] = useState('');
  const [testData, setTestData] = useState({host:"", method:"", requrl:"", statuscode:"", body:"" })
  const [userName, setUserName] = useState('')
  const [message, setMessage] = useState('');
  const [messageList, setMessageList] = useState([]);
  
  const formRef = useRef(null);
  useEffect(() => {
    socket = io(SERVER_ENDPOINT);
  }, []);

  useEffect(() =>{
    socket.on("receive_message", (data) =>{
    setMessageList([...messageList,data])
    });
  });

  const connectToRoom = () =>{
    setLoggedIn(true);

    socket.emit("join_room", room);
  };

  const sendMessage = async() =>{

    let messageContent = {
        room: room,
        content:{
            username: userName,
            message: message
        }
    };

    await socket.emit("send_message", messageContent);
    setMessageList([...messageList, messageContent.content])
    setMessage("");

    formRef.current.reset();

  };


  const btnStyle = {
    margin:"50px 0 0 100px",
    border:"none",
    backgroundColor:"orange",
    borderRadius:5,
    padding:"10px",
    color:"white"
  }

  const resStyle = {
    margin:"50px 0 0 100px",
    border:"1px solid orange",
    borderRadius:5,
    padding:"10px",
    color:"orange"
  }

  return (
    <div>
    <Form  ref={formRef}>
    {
        !loggedIn ?(
        <Container>
            <br/>
            <Card>
            <Card.Body>
                <Card.Title>Please join a chat</Card.Title>
                <Card.Text>
                <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Name:</Form.Label>
                    <Form.Control type="text" onChange={(e)=>{setUserName(e.target.value)}} placeholder="Write a name..." />
                </Form.Group>
                <Form.Group className="mb-3" controlId="room">
                    <Form.Label>Room:</Form.Label>
                    <Form.Control type="text" onChange={(e)=>{setRoom(e.target.value)}} placeholder="Write a room..." />
                </Form.Group>
                </Card.Text>
                <Button onClick={connectToRoom} variant="primary">Enter</Button>
            </Card.Body>
            </Card>
        </Container>
        ):(
        <Container>
            <br/>
            <h3>Chat Room</h3>
            <hr/>
            { messageList.map((key, val) =>{
                return(
                    <div>
                    <b>{key.username}</b> - {key.message}
                    </div>
                );
            })}
            <br/>
            <Form.Group className="mb-3" controlId="message">
                <Form.Control type="text" onChange={(e)=>{setMessage(e.target.value)}} placeholder="Write a message..." /> <br/>
                <Button onClick={sendMessage} variant="primary">Enter</Button>
            </Form.Group>
        </Container>
        )
    }
    </Form>

    <button onClick={(e)=>{
        axios.get(`${SERVER_ENDPOINT}/test`).then(res=>{
          const {host:h,method:m,requrl:r,statuscode:s} = res.data
          setTestData({
            host:h,
            method:m,
            requrl:r,
            statuscode:s
          })
          
        })
      }} 
      style={btnStyle}>
      Test Connection
    </button>
    
      {
        testData.host && <div style={resStyle}>Path: {testData.host}{testData.requrl} | StatusCode: {testData.statuscode}</div>
      } 
      
    </div>
  );

}

export default App;
