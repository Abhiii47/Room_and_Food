import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings, cancelBooking } from '../api/bookings';
import AuthContext from '../context/AuthContext';
import '../styles/MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      setBookings(data);
    } catch (err) {
      setError('Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyBookings();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId);
        fetchMyBookings(); // Refresh the list
        alert('Booking cancelled successfully');
      } catch (err) {
        alert('Failed to cancel booking: ' + err.message);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      requested: 'status-pending',
      pending: 'status-pending',
      approved: 'status-confirmed',
      confirmed: 'status-confirmed',
      rejected: 'status-cancelled',
      cancelled: 'status-cancelled',
      completed: 'status-completed'
    };

    return <span className={`status-badge ${statusClasses[status] || 'status-pending'}`}>{status.toUpperCase()}</span>;
  };

  if (loading) return <p>Loading your bookings...</p>;

  return (
    <div className="my-bookings-container">
      <h2>My Bookings</h2>
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && bookings.length === 0 ? (
        <div className="no-bookings-card">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <h3>No Bookings Yet</h3>
          <p>You haven't made any bookings yet. Browse listings to find your perfect room or food service!</p>
          <Link to="/" className="btn-primary">Browse Listings</Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => {
            if (!booking.listing) return null; // Skip invalid bookings where listing was deleted

            return (
              <div key={booking._id} className="booking-card">
                <div className="booking-image">
                  <img
                    src={booking.listing.imageUrl || 'https://placehold.co/150x150'}
                    alt={booking.listing.title}
                  />
                </div>
                <div className="booking-details">
                  <h3>{booking.listing.title}</h3>
                  <p className="booking-type">Type: {booking.listing.type || 'N/A'}</p>
                  <p className="booking-price">Price: ₹{booking.listing.price || 'N/A'}/month</p>
                  <p className="booking-date">Booked on: {new Date(booking.createdAt).toLocaleDateString()}</p>
                  {booking.fromDate && (
                    <p className="start-date">From: {new Date(booking.fromDate).toLocaleDateString()}</p>
                  )}
                  {booking.toDate && (
                    <p className="end-date">To: {new Date(booking.toDate).toLocaleDateString()}</p>
                  )}
                  {booking.status && (
                    <p className="booking-status">Status: {booking.status}</p>
                  )}
                </div>
                <div className="booking-actions">
                  {getStatusBadge(booking.status || 'requested')}
                  <div className="action-buttons">
                    <Link
                      to={`/listings/${booking.listing._id}`}
                      className="btn-view"
                    >
                      View Listing
                    </Link>
                    {(booking.status === 'requested' || booking.status === 'pending') && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="booking-tips">
        <h3>💡 Booking Tips</h3>
        <ul>
          <li>Contact vendors directly through the chat system</li>
          <li>Confirm all details before making a booking</li>
          <li>Keep track of your booking status</li>
          <li>Report any issues to support immediately</li>
        </ul>
      </div>
    </div>
  );
};

export default MyBookings;