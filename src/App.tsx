import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './(auth)/Login';
import CoursePage from './(dashboard)/CoursePage';
import CreateCourse from "./(dashboard)/CreateCourse";
import CreateStudent from './(dashboard)/CreateStudent';
import Dashboard from './(dashboard)/Dashboard';
import InvitePage from './(dashboard)/Invite';
import Stats from './(dashboard)/Stats';
import StatsDetail from './(dashboard)/StatsDetail';
import Tracking from './(dashboard)/Tracking';
import UserProfile from './(dashboard)/UserProfile';
import Layout from './_layout';
import LayoutAuth from './_layout_auth';
import LayoutDashboard from './_layout_dashboard';
import './App.css';

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
          <Route path='create/course' element={<CreateCourse />} />
          <Route path="create/student" element={<CreateStudent />} />
          <Route path="stats" element={<Stats />} />
          <Route path="stats/:idStat" element={<StatsDetail />} />
          <Route path="test" element={<Tracking />} />
          <Route path="profile" element={<UserProfile />} />
        </Route>
        <Route path='course/:id' element={<CoursePage />} />
        <Route path='invite/:token' element={<InvitePage />} />
      </Routes>
    </Router>
  );
}

export default App
