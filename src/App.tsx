import React, { useEffect } from "react"
import Routing from "@/routes/Routing"
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from "react-redux"
import store, { persistor } from "@/redux/store"
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const queryClient = new QueryClient({})
const App = () => {

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        } else {
          console.log('Notification permission denied.');
        }
      });
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker.ready.then(registration => {
    //     registration.showNotification('Test Notification', {
    //       body: 'This is a manually triggered notification',
    //       icon: '/favicon.svg',
    //       data: '/'
    //     });
    //   });
    // }
    
  }, []);

  return (

    <React.Fragment>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <ToastContainer />
            <Routing />
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </React.Fragment>
  )
}

export default App