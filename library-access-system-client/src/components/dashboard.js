import React, { useEffect, useState } from 'react';
import { API_URL } from '../config'; // Import API_URL from config.js

function Dashboard() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_URL}/api/books`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book._id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.genre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;