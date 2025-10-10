import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Login from './(auth)/Login'
import Create from './(dashboard)/Create'
import Dashboard from './(dashboard)/Dashboard'
import Layout from './_layout'
import LayoutAuth from './_layout_auth'
import LayoutDashboard from './_layout_dashboard'
import './App.css'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
        </Route>
        <Route path='/auth' element={<LayoutAuth />}>
          <Route path='login' element={<Login />} />
        </Route>
        <Route path="/dashboard" element={<LayoutDashboard />}>
          <Route index element={<Dashboard />} />
          <Route path='create' element={<Create />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App
