import Chatbot from "./components/chatbox/Chatbot";
import "./index.css";
import AppRouter from "./routers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  console.log(process.env.REACT_APP_API_URL);
  return (
    <div className="App  ">
      <AppRouter /> <ToastContainer position="top-right" autoClose={3000} />
      <Chatbot />
    </div>
  );
}

export default App;
