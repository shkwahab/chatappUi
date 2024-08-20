import React from "react"
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