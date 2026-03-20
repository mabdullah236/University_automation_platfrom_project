import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaCalendarCheck, FaMapMarkerAlt, FaClock, FaPlus, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../components/ConfirmationModal';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    organizer: '',
  });

  // Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', formData);
      await api.post('/events', formData);
      toast.success('Event created successfully!');
      setShowForm(false);
      fetchEvents();
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        organizer: '',
      });
    } catch (error) {
      console.error('Error creating event:', error);
      console.error('Error creating event:', error);
      toast.error('Failed to create event.');
    }
  };

  const openDeleteModal = (id) => {
    setEventToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/events/${eventToDelete}`);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <FaCalendarCheck className="mr-3 text-purple-500" /> Upcoming Events
        </h1>
        {user.role === 'admin' && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <FaPlus className="mr-2" /> {showForm ? 'Close Form' : 'Add Event'}
          </button>
        )}
      </div>

      {showForm && user.role === 'admin' && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-gray-400 mb-1">Event Title</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-400 mb-1">Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange}
                required
                rows="3"
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              ></textarea>
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Date</label>
              <input 
                type="date" 
                name="date" 
                value={formData.date} 
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Time</label>
              <input 
                type="time" 
                name="time" 
                value={formData.time} 
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Venue</label>
              <input 
                type="text" 
                name="venue" 
                value={formData.venue} 
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Organizer</label>
              <input 
                type="text" 
                name="organizer" 
                value={formData.organizer} 
                onChange={handleChange}
                required
                className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
              />
            </div>
            <div className="md:col-span-2 mt-4">
              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold transition-colors">
                Publish Event
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event._id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700 hover:border-purple-500 transition-colors">
            <div className="bg-purple-900 p-4">
              <h3 className="text-xl font-bold text-white truncate">{event.title}</h3>
              <h3 className="text-xl font-bold text-white truncate">{event.title}</h3>
              <div className="flex justify-between items-center">
                <p className="text-purple-200 text-sm">{event.organizer}</p>
                {user.role === 'admin' && (
                  <button 
                    onClick={() => openDeleteModal(event._id)}
                    className="text-red-400 hover:text-red-200 transition-colors"
                    title="Delete Event"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-300 mb-4 h-12 overflow-hidden">{event.description}</p>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <FaCalendarCheck className="mr-2 text-purple-400" /> 
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <FaClock className="mr-2 text-purple-400" /> 
                  {event.time}
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-purple-400" /> 
                  {event.venue}
                </div>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            No upcoming events.
          </div>
        )}
      </div>


      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        isDanger={true}
      />
    </div>
  );
};

export default Events;
