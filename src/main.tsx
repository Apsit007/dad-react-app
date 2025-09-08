import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@mui/material/styles'
import theme from './theme.ts'
//  Import ที่จำเป็นสำหรับ Date Picker
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
//------------------------------------------------------------------------
// 👉 Import Redux
import { Provider } from 'react-redux';
import { persistor, store } from './store';
import { PersistGate } from 'redux-persist/integration/react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <App />
          </LocalizationProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
