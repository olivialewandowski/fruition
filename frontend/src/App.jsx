/* This is the route of our application that allows us to navigate 
between different pages by going to a different adress in the URL bar */
import react from "react"
import {BrowserRouter, Routes, Route} from "react-router-dom"

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        {/* Route for the homepage */}
        <Route path="/" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
