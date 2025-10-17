import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { DashboardProvider } from './context/DashboardContext.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <DashboardProvider>
        {/* <ThemeProvider theme={theme["dark"]}> */}
          <App />
        {/* </ThemeProvider> */}
      </DashboardProvider>
    </AuthProvider>
  </StrictMode>
);
