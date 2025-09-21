import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const CustomerDetail = ({ updateAllData }) => {
  const { id } = useParams();
  const [customerDetail, setCustomerDetail] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [hasOnlyOneAddress, setHasOnlyOneAddress] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [custRes, addrRes] = await Promise.all([
          axios.get(`/api/customers/${id}`),
          axios.get(`/api/customers/${id}/addresses`)
        ]);
        setCustomerDetail(custRes.data);
        setAddresses(addrRes.data.addresses);
        setHasOnlyOneAddress(addrRes.data.hasOnlyOneAddress);
      } catch (error) {
        alert('Error loading data: ' + (error.response?.data?.error || error.message));
      }
    };
    loadData();
  }, [id]);

  const handleMarkOneAddress = () => {
    if (addresses.length === 1) {
      setHasOnlyOneAddress(true);
      alert('Marked as one address');
    } else {
      alert('Has multiple addresses');
    }
  };

  const handleDeleteCustomer = async () => {
    if (confirm('Sure?')) {
      try {
        await axios.delete(`/api/customers/${id}`);
        alert('Deleted!');
        await updateAllData();
        window.history.back();
      } catch (error) {
        alert('Error: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  if (!customerDetail) return <div className="text-center py-8 text-gray-500">Loading...</div>;

  return (
    <div className="bg-white shadow-xl rounded-xl p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{customerDetail.first_name} {customerDetail.last_name}</h2>
          <p className="text-gray-600 mt-2">ID: <span className="font-semibold text-blue-600">{customerDetail.id}</span> | Phone: {customerDetail.phone_number}</p>
          {hasOnlyOneAddress && <p className="text-green-600 mt-2 font-medium">Status: Only One Address</p>}
        </div>
        <div className="space-y-2">
          <Link to={`/customers/${id}/edit`} className="block bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition">Edit</Link>
          <button onClick={handleDeleteCustomer} className="block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">Delete</button>
        </div>
      </div>
      <button onClick={handleMarkOneAddress} className="text-blue-600 underline mb-6 hover:text-blue-800">Mark as One Address</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Profile</h3>
          <p>{addresses[0]?.address_details || 'N/A'}, {addresses[0]?.city || ''}, {addresses[0]?.state || ''} - {addresses[0]?.pin_code || ''}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Orders</h3>
          <p className="text-gray-500">Placeholder</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Payments</h3>
          <p className="text-gray-500">Placeholder</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Shipping</h3>
          <Link to={`/customers/${id}/addresses`} className="text-blue-600 hover:underline">Manage Addresses</Link>
        </div>
      </div>
      <div className="mt-6 flex space-x-4">
        <Link to={`/customers/${id}/addresses`} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">View Addresses</Link>
        <Link to="/customers" className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition">Back to List</Link>
      </div>
    </div>
  );
};

export default CustomerDetail;