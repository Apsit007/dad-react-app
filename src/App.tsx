

import MainLayout from "./layout/mainLayout";
import InOutPage from "./pages/DashBoard";



function App() {
  return (
    <MainLayout>
      {/* เนื้อหาของหน้าเพจจะถูกแสดงตรงนี้ */}
      <InOutPage />
    </MainLayout>
  )
}

export default App;
