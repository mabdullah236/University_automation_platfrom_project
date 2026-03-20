import { useState, useEffect } from 'react';
import api from '../services/api';

const Library = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get('/library/books');
      setBooks(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBorrow = async (bookId) => {
    try {
      await api.post('/library/borrow', { bookId });
      alert('Book borrowed successfully!');
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.error || 'Error borrowing book');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Library Catalog</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {books.map(book => (
          <div key={book._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-1">{book.title}</h3>
              <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{book.category}</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className={`text-sm font-bold ${book.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {book.available} Available
              </span>
              <button 
                onClick={() => handleBorrow(book._id)}
                disabled={book.available < 1}
                className={`px-3 py-1 rounded text-sm ${
                  book.available > 0 
                    ? 'bg-primary text-white hover:bg-blue-600' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Borrow
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
