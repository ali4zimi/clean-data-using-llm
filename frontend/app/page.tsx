'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [word, setWord] = useState('');
  const [meaning, setMeaning] = useState('');
  const [words, setWords] = useState<{ id: string | number; word: string; meaning: string }[]>([]);

  useEffect(() => {
    fetch('/api/wordlist')
      .then(res => res.json())
      .then(setWords);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch('/api/wordlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word, meaning }),
    });

    if (res.ok) {
      const newWord = await res.json();
      setWords(prev => [...prev, newWord]);
      setWord('');
      setMeaning('');
    }
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Word List</h1>

      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Word"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Meaning"
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Word
        </button>
      </form>

      <ul className="space-y-2">
        {words.map((w) => (
          <li key={w.id} className="border p-2 rounded">
            <strong>{w.word}</strong>: {w.meaning}
          </li>
        ))}
      </ul>
    </main>
  );
}
