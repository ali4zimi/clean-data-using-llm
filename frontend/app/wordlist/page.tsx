'use client';

import { useEffect, useState } from 'react';

export default function HelloFromServer() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error('Failed to fetch:', err));
  }, []);

  return (
    <main className="p-4">
      <h1>Message from backend:</h1>
      <p>{message}</p>
    </main>
  );
}