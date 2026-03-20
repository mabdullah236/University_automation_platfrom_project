import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const Events = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/advanced/events');
      setEvents(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Upcoming Events</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => (
          <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-primary p-4 text-white">
              <h3 className="font-bold text-lg">{event.title}</h3>
              <span className="text-xs bg-white/20 px-2 py-1 rounded">{event.type}</span>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">{event.description}</p>
              
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <FaCalendarAlt className="mr-2" />
                <span>{new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString()}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <FaMapMarkerAlt className="mr-2" />
                <span>{event.venue}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                Organized by: {event.organizer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
