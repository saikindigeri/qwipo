import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const CustomerForm = ({ updateAllData }) => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ first_name: '', last_name: '', phone_number: '', address_details: '', city: '', state: '', pin_code: '' });
  const [errors, setErrors] = useState({});
  const [addresses, setAddresses] = useState([]);

  const validate = () => {
    const newErrors = {};
    if (formData.first_name.length < 2) newErrors.first_name = 'Min 2 chars';
    if (formData.last_name.length < 2) newErrors.last_name = 'Min 2 chars';
    if (!/^\d{10}$/.test(formData.phone_number)) newErrors.phone_number = '10 digits';
    if (formData.address_details && formData.address_details.length < 5) newErrors.address_details = 'Min 5 chars';
    if (formData.city && formData.city.length < 2) newErrors.city = 'Min 2 chars';
    if (formData.state && formData.state.length < 2) newErrors.state = 'Min 2 chars';
    if (formData.pin_code && !/^\d{5,6}$/.test(formData.pin_code)) newErrors.pin_code = '5-6 digits';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      let custId = id;
      if (isEdit) {
        await axios.put(`/api/customers/${id}`, { 
          first_name: formData.first_name, 
          last_name: formData.last_name, 
          phone_number: formData.phone_number 
        });
        if (formData.address_details && formData.city && formData.state && formData.pin_code) {
          if (addresses[0]) {
            await axios.put(`/api/addresses/${addresses[0].id}`, {
              address_details: formData.address_details,
              city: formData.city,
              state: formData.state,
              pin_code: formData.pin_code
            });
          } else {
            await axios.post(`/api/customers/${id}/addresses`, {
              address_details: formData.address_details,
              city: formData.city,
              state: formData.state,
              pin_code: formData.pin_code
            });
          }
        }
      } else {
        const custRes = await axios.post('/api/customers', { 
          first_name: formData.first_name, 
          last_name: formData.last_name, 
          phone_number: formData.phone_number 
        });
        custId = custRes.data.id;
        if (formData.address_details && formData.city && formData.state && formData.pin_code) {
          await axios.post(`/api/customers/${custId}/addresses`, {
            address_details: formData.address_details,
            city: formData.city,
            state: formData.state,
            pin_code: formData.pin_code
          });
        }
      }
      alert(isEdit ? 'Updated!' : 'Created!');
      await updateAllData();
      navigate('/customers');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  useEffect(() => {
    if (isEdit) {
      const loadData = async () => {
        try {
          const [custRes, addrRes] = await Promise.all([
            axios.get(`/api/customers/${id}`),
            axios.get(`/api/customers/${id}/addresses`)
          ]);
          const firstAddr = addrRes.data.addresses[0] || {};
          setFormData({
            first_name: custRes.data.first_name,
            last_name: custRes.data.last_name,
            phone_number: custRes.data.phone_number,
            address_details: firstAddr.address_details || '',
            city: firstAddr.city || '',
            state: firstAddr.state || '',
            pin_code: firstAddr.pin_code || ''
          });
          setAddresses(addrRes.data.addresses);
        } catch (error) {
          alert('Error loading data: ' + (error.response?.data?.error || error.message));
        }
      };
      loadData();
    }
  }, [id, isEdit]);

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl rounded-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Customer' : 'Create Customer'}</h2>
        <Link to="/customers" className="text-gray-500 hover:text-gray-700">← Back</Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input 
            value={formData.first_name} 
            onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
            className={`w-full px-4 py-3 border rounded-lg ${errors.first_name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`} 
          />
          {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input 
            value={formData.last_name} 
            onChange={(e) => setFormData({...formData, last_name: e.target.value})} 
            className={`w-full px-4 py-3 border rounded-lg ${errors.last_name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`} 
          />
          {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input 
            value={formData.phone_number} 
            onChange={(e) => setFormData({...formData, phone_number: e.target.value})} 
            className={`w-full px-4 py-3 border rounded-lg ${errors.phone_number ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`} 
          />
          {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address Details (Optional)</label>
          <input 
            value={formData.address_details} 
            onChange={(e) => setFormData({...formData, address_details: e.target.value})} 
            className={`w-full px-4 py-3 border rounded-lg ${errors.address_details ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`} 
          />
          {errors.address_details && <p className="text-red-500 text-sm mt-1">{errors.address_details}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City (Optional)</label>
            <input 
              value={formData.city} 
              onChange={(e) => setFormData({...formData, city: e.target.value})} 
              className={`w-full px-4 py-3 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`} 
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State (Optional)</label>
            <input 
              value={formData.state} 
              onChange={(e) => setFormData({...formData, state: e.target.value})} 
              className={`w-full px-4 py-3 border rounded-lg ${errors.state ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`} 
            />
            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code (Optional)</label>
          <input 
            value={formData.pin_code} 
            onChange={(e) => setFormData({...formData, pin_code: e.target.value})} 
            className={`w-full px-4 py-3 border rounded-lg ${errors.pin_code ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`} 
          />
          {errors.pin_code && <p className="text-red-500 text-sm mt-1">{errors.pin_code}</p>}
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium">{isEdit ? 'Update Customer' : 'Create Customer'}</button>
      </form>
    </div>
  );
};

export default CustomerForm;