"use client";
import {login, logout, googleIn} from '@/lib/actions';
import '@/app/globals.css';

function LoginGoogle() {
  return(
    <div id="github-btn" onClick={() => googleIn()} style={{
      animation: 'pop-up-2 1.5s ease-in forwards'
    }}>
      <div className='btn-content' style={{
        transform: 'rotate(-45deg)'
      }}>
        <div id='google-logo'></div>
        <div> Sign in with Google </div>
      </div>
    </div>
  )
}

export function LoginGithub() {
  return(
    <div id='login-btn'>
      <div id="github-btn" onClick={() => login()}>
        <div className='btn-content'>
          <div id='gitlogo'></div>
          <div> Sign in with GitHub </div>
        </div>
      </div>
      <LoginGoogle/>
    </div>
  )
}
