"use client";
import {login, logout} from '@/lib/actions';
import '@/app/globals.css';

function LoginGoogle() {
  return(
    <div id="github-btn" onClick={() => login()} style={{
      animation: 'pop-up-2 1.5s ease-in forwards;'
    }}>
      <div id='gitlogo'></div>
      <div> Sign in with Google </div>
    </div>
  )
}

export function LoginGithub() {
  return(
    <div id='login-btn'>
      <div id="github-btn" onClick={() => login()}>
        <div id='gitlogo'></div>
        <div> Sign in with GitHub </div>
      </div>
      <LoginGoogle/>
    </div>
  )
}
