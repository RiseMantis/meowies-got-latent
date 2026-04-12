import './globals.css'
import Link from 'next/link';

export default function Home() {

  return (
    <main id='home-container'>
      <h1 id='main-heading'>
        Meowies
      </h1>

      <Link href="/wac">
        <div id="go-ahead">
          <span>Enter</span>
        </div>
      </Link>
    </main>
  );
}
