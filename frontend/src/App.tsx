import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { AppProvider } from "./app/AppProvider"
import { authRoute } from "./features/auth/auth.route"
import { workspaceRoutes } from "./features/workspace/workspace.route"

const appRoutes = createBrowserRouter([...workspaceRoutes, ...authRoute])
function App() {
  return (
    <AppProvider>
      <RouterProvider router={appRoutes} />
    </AppProvider>
  )
}
export default App