import db from '../../../lib/db'; // Adjust the path as necessary
import { NextResponse } from 'next/server';

// Promisify db.all and db.run
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function insertQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID });
    });
  });
}

export async function GET() {
  try {
    const words = await runQuery('SELECT * FROM wordlist');
    return NextResponse.json(words);
  } catch (err) {
    return new NextResponse('Database error', { status: 500 });
  }
}

export async function POST(req) {
  const { word, meaning } = await req.json();

  if (!word || !meaning) {
    return new NextResponse('Missing word or meaning', { status: 400 });
  }

  try {
    const result = await insertQuery(
      'INSERT INTO wordlist (word, meaning) VALUES (?, ?)',
      [word, meaning]
    );
    return NextResponse.json({ id: result.id, word, meaning });
  } catch (err) {
    return new NextResponse('Insert failed', { status: 500 });
  }
}
