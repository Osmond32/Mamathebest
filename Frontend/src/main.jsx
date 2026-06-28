import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext'
import './style/index.css'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>,
)
