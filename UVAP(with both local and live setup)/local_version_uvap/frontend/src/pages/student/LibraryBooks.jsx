import React, { useState, useEffect } from 'react';

const LibraryBooks = () => {
  const [activeTab, setActiveTab] = useState('myBooks');
  const [myBooks, setMyBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'myBooks') {
        const res = await fetch('http://localhost:5001/api/v1/library/my', { headers });
        const data = await res.json();
        if (data.success) setMyBooks(data.data);
      } else {
        const res = await fetch('http://localhost:5001/api/v1/library/books', { headers });
        const data = await res.json();
        if (data.success) setAllBooks(data.data);
      }
    } catch (err) {
      console.error('Error fetching library data:', err);
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Library</h1>
      <p className="text-gray-600 mb-8">Manage your borrowed books and browse the catalog.</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-4 font-medium text-sm focus:outline-none transition-colors ${
              activeTab === 'myBooks'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('myBooks')}
          >
            My Borrowed Books
          </button>
          <button
            className={`px-6 py-4 font-medium text-sm focus:outline-none transition-colors ${
              activeTab === 'catalog'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('catalog')}
          >
            Book Catalog
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : activeTab === 'myBooks' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                    <th className="px-6 py-4">Book Title</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">Issue Date</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myBooks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        You haven't borrowed any books yet.
                      </td>
                    </tr>
                  ) : (
                    myBooks.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {record.book?.title || 'Unknown Book'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {record.book?.author || 'Unknown Author'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(record.issueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`${
                              isOverdue(record.dueDate) && record.status === 'Borrowed'
                                ? 'text-red-600 font-bold'
                                : 'text-gray-600'
                            }`}
                          >
                            {new Date(record.dueDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              record.status === 'Returned'
                                ? 'bg-green-100 text-green-800'
                                : isOverdue(record.dueDate)
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {record.status === 'Borrowed' && isOverdue(record.dueDate)
                              ? 'Overdue'
                              : record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allBooks.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">No books in the library.</div>
              ) : (
                allBooks.map((book) => (
                  <div
                    key={book._id}
                    className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{book.title}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          book.available > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {book.available > 0 ? 'Available' : 'Issued'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Author:</span> {book.author}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Category:</span> {book.category}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">ISBN:</span> {book.isbn}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryBooks;
