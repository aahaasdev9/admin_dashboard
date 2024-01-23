import './App.css';

import 'firebase/analytics';
import { auth } from './firebase';
import { useAuthState } from "react-firebase-hooks/auth";

import Welcome from './Components/Welcome';
import ChatBox from './Components/ChatBox';
import axios from 'axios';

axios.defaults.baseURL = "http://192.168.1.2:8000/api";
// axios.defaults.baseURL = "https://api.aahaas.com/api";

axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.post["Accept"] = "application/json";
axios.defaults.withCredentials = true;

function App() {

  const [user] = useAuthState(auth);

  return (
    <div>
      {!user ? (
        <Welcome />
      ) : (
        <ChatBox />
      )}
    </div>
  );
}

export default App;