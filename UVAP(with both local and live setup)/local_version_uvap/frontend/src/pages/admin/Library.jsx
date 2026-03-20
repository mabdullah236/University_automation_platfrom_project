import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FaPlus, FaTrash, FaBook, FaExchangeAlt } from 'react-icons/fa';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    quantity: 1,
    available: 1,
  });

  const [issueData, setIssueData] = useState({
    rollNumber: '',
    dueDate: '',
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get('/library/books');
      setBooks(res.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      setLoading(false);
    }
  };

  const handleBookChange = (e) => {
    setBookData({ ...bookData, [e.target.name]: e.target.value });
  };

  const handleIssueChange = (e) => {
    setIssueData({ ...issueData, [e.target.name]: e.target.value });
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...bookData, available: bookData.quantity };
      await api.post('/library/books', payload);
      setShowAddModal(false);
      setBookData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        quantity: 1,
        available: 1,
      });
      fetchBooks();
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Failed to add book');
    }
  };

  const openIssueModal = (bookId) => {
    setSelectedBookId(bookId);
    setShowIssueModal(true);
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      await api.post('/library/issue', {
        bookId: selectedBookId,
        rollNumber: issueData.rollNumber,
        dueDate: issueData.dueDate,
      });
      setShowIssueModal(false);
      setIssueData({ rollNumber: '', dueDate: '' });
      alert('Book issued successfully');
      fetchBooks();
    } catch (error) {
      console.error('Error issuing book:', error);
      alert(error.response?.data?.message || 'Failed to issue book');
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <FaBook className="mr-3 text-purple-500" /> Library Management
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center transition-colors"
        >
          <FaPlus className="mr-2" /> Add New Book
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-700 text-gray-300 uppercase text-sm">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">ISBN</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {books.length > 0 ? (
                books.map((book) => (
                  <tr key={book._id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">{book.title}</td>
                    <td className="py-3 px-4">{book.author}</td>
                    <td className="py-3 px-4">{book.isbn}</td>
                    <td className="py-3 px-4">{book.category}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          book.available > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {book.available} / {book.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {book.available > 0 ? (
                        <button
                          onClick={() => openIssueModal(book._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
                        >
                          <FaExchangeAlt className="mr-1" /> Issue
                        </button>
                      ) : (
                        <span className="text-gray-500 text-sm italic">Unavailable</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500">
                    No books found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white">Add New Book</h2>
            <form onSubmit={handleAddBook}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={bookData.title}
                  onChange={handleBookChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-400 mb-1">Author</label>
                <input
                  type="text"
                  name="author"
                  value={bookData.author}
                  onChange={handleBookChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div className="flex space-x-4 mb-4">
                <div className="w-1/2">
                  <label className="block text-gray-400 mb-1">ISBN</label>
                  <input
                    type="text"
                    name="isbn"
                    value={bookData.isbn}
                    onChange={handleBookChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-gray-400 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={bookData.category}
                    onChange={handleBookChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-400 mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={bookData.quantity}
                  onChange={handleBookChange}
                  min="1"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Book Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white">Issue Book</h2>
            <form onSubmit={handleIssueBook}>
              <div className="mb-4">
                <label className="block text-gray-400 mb-1">Student Roll No</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={issueData.rollNumber}
                  onChange={handleIssueChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  required
                  placeholder="e.g., 2023-CS-001"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-400 mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={issueData.dueDate}
                  onChange={handleIssueChange}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Issue Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
