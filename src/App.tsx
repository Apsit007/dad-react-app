// src/App.tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from './layout/mainLayout';
import DashBoardPage from './pages/DashBoardPage';
import SearchPerson from './pages/Search/SearchPerson';
import SearchCar from './pages/Search/SearchCar';
import SerachVideo from './pages/Search/SerachVideo';
import PersonInfoList from './pages/Infos/PersonInfo/PersonInfoList';
import PersonInfoForm from './pages/Infos/PersonInfo/PersonInfoForm';
import CarInfoList from './pages/Infos/CarInfo/CarInfoList';
import SystemSettings from './pages/Settings/System';
import UserListPage from './pages/Settings/UserManage/UserList';
import UserInfoPage from './pages/Settings/UserManage/UserInfo';
import LoginPage from './pages/auth/Login';

// 1. Create the router configuration
const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    element: <LoginPage />,
  },
  // App routes
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true, // This makes it the default child route
        element: <Navigate to="/dashboard" replace />, // Redirect from "/" to "/dashboard"
      },
      {
        path: "settings/system",
        element: <SystemSettings />,
      },
      {
        path: "settings/usermanage/userlist",
        element: <UserListPage />,
      },
      {
        path: "settings/usermanage/userinfo",
        element: <UserInfoPage />,
      },
      {
        path: "dashboard",
        element: <DashBoardPage />,
      },
      {
        path: "search/person",
        element: <SearchPerson />,
      },
      {
        path: "search/car",
        element: <SearchCar />,
      },
      {
        path: "search/video",
        element: <SerachVideo />,
      },
      {
        path: "info/person",
        element: <PersonInfoList />,
      },
      {
        path: "info/person/form",
        element: <PersonInfoForm />,
      },
      {
        path: "info/car",
        element: <CarInfoList />,
      },

    ],
  },
]);

// 2. Create the App component to provide the router
function App() {
  return <RouterProvider router={router} />;
}

export default App;
