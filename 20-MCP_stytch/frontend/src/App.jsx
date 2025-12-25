import './App.css'
import { StytchLogin, IdentityProvider, useStytchUser, useStytch } from "@stytch/react";
import { useEffect } from 'react';

function App() {
  const { user } = useStytchUser();
  const stytch = useStytch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const tokenType = params.get('stytch_token_type');

    if (token && tokenType === 'magic_links') {
      stytch.magicLinks.authenticate(token, {
        session_duration_minutes: 60
      }).then(() => {
        window.history.replaceState({}, document.title, '/');
      }).catch(err => {
        console.error('Auth error:', err);
      });
    }
  }, [stytch]);

  const config = {
    "products": [
      "emailMagicLinks"
    ],
    "emailMagicLinksOptions": {
      "loginRedirectURL": "http://localhost:5173",
      "loginExpirationMinutes": 60,
      "signupRedirectURL": "http://localhost:5173",
      "signupExpirationMinutes": 60
    }
  }

  return (
    <div>
      {!user ? <StytchLogin config={config} /> : <IdentityProvider />}
    </div>
  )
}

export default App
