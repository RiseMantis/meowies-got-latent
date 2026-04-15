import './globals.css'
import Link from 'next/link';
import {Andika} from "next/font/google";
import { LoginGithub } from './components/loginButton';
const andika = Andika({
  weight: ['700'],
  subsets: ['latin'],
  display: 'swap'
})

export default function Home() {

  return (
    <main id='home-container'>
      <h1 id='main-heading' className={andika.className}>
        Walks&Chills
      </h1>

      <Link href="/wac">
        <div id="go-ahead">
          
        </div>
      </Link>

      <LoginGithub/>
    </main>
  );
}
