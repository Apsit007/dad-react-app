// src/App.tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from './layout/mainLayout';
import DashBoardPage from './pages/DashBoardPage';
import SearchPerson from './pages/SearchPerson';
import SearchCar from './pages/SearchCar';
import PersonInfoList from './pages/PersonInfo/PersonInfoList';
import PersonInfoForm from './pages/PersonInfo/PersonInfoForm';
import CarInfoList from './pages/CarInfo/CarInfoList';

// 1. Create the router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true, // This makes it the default child route
        element: <Navigate to="/dashboard" replace />, // Redirect from "/" to "/dashboard"
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