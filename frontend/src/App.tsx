import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Login from "./components/auth/Login";
import Home from "./components/Home";
import SignUp from "./components/auth/Signup";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/signup",
    element: <SignUp />
  }
])


function App() {
  return (
    <div>
      <RouterProvider router={appRouter}/>
    </div>
  )
}

export default App
