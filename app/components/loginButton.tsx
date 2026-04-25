"use client";
import {login, logout, googleIn, credentialsIn} from '@/lib/actions';
import '@/app/globals.css';

export function LoginGoogle() {
  return(
    <div className="rhombus-btn glass-panel group" onClick={() => googleIn()} style={{ animationDelay: '0.2s' }}>
      <div className='btn-content'>
        <div className="google-logo"></div>
        <div className="text-center font-medium text-sm">Google</div>
      </div>
    </div>
  )
}

export function LoginCredentials() {
  return(
    <div className="rhombus-btn glass-panel group" onClick={() => credentialsIn()} style={{ animationDelay: '0.4s' }}>
      <div className='btn-content'>
        <div className="text-3xl mb-1 flex items-center justify-center">🔑</div>
        <div className="text-center font-medium text-sm">Email</div>
      </div>
    </div>
  )
}

export function LoginGithub() {
  return(
    <div className="rhombus-btn glass-panel group" onClick={() => login()} style={{ animationDelay: '0s' }}>
      <div className='btn-content'>
        <div className="git-logo"></div>
        <div className="text-center font-medium text-sm">GitHub</div>
      </div>
    </div>
  )
}
