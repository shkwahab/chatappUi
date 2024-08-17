import React, { useEffect } from 'react'
import ChatApp from "../../components/Chat/Home"
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { Auth } from '../../apis/types';
import { RootState } from '../../redux/store';

const Home = () => {
  const authCtx: Auth = useSelector((state: RootState) => state.authCtx)
  const navigate = useNavigate()
  useEffect(()=>{
    if(authCtx.isLogin){
      navigate("/")
    }
  },[])
  return (
    <React.Fragment>
      <ChatApp user={authCtx.user} />
    </React.Fragment>
  )
}

export default Home