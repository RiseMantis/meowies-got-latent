import './globals.css'
import Link from 'next/link';
import {Andika} from "next/font/google";
import { LoginGithub, LoginGoogle, LoginCredentials } from './components/loginButton';

const andika = Andika({
  weight: ['700'],
  subsets: ['latin'],
  display: 'swap'
})

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('/bg-calming.png')", backgroundSize: "contain"}}>
      {/* Soft overlay to ensure readability */}
      <div className="absolute inset-0 bg-white/30 dark:bg-slate-950/70 backdrop-blur-sm transition-colors duration-500"></div>
      
      <div className="relative z-10 w-full flex flex-col items-center justify-center flex-1 py-12 px-4">
        <h1 id='main-heading' className={`${andika.className} text-5xl md:text-6xl lg:text-7xl text-center mb-24 md:mb-32 animate-fade-in-down`}>
          Paw Paths
        </h1>

        <div className='flex flex-col h-5'></div>
        <div className='flex flex-col h-5'></div>
        <div className='flex flex-col h-5'></div>
        <div className='flex flex-col h-5'></div>


        <div className="diamond-grid">
          {/* Top row */}
          <div className="grid-row justify-center">
            <Link href="/wac" className="rhombus-btn enter-btn glass-panel group">
              <div className="btn-content">
                <div className="paw-icon">🐾</div>
                <div className="font-bold text-lg mt-1 tracking-wider text-sky-900 dark:text-sky-100 group-hover:scale-110 transition-transform duration-300">Enter</div>
              </div>
            </Link>
          </div>
          
          {/* Middle row */}
          <div className="grid-row justify-between mt-4 sm:mt-2 md:-mt-2">
            <LoginGithub />
            <LoginGoogle />
          </div>

          {/* Bottom row */}
          <div className="grid-row justify-center mt-4 sm:mt-2 md:-mt-2">
            <LoginCredentials />
          </div>
        </div>
      </div>
    </main>
  );
}
