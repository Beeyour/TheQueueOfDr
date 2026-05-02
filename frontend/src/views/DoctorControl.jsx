import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

function DoctorControl() {
  const { uuid } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDoctor = async () => {
    try {
      const response = await api.get(`/patient/${uuid}`);
      const patientData = response.data;
      
      const doctorsResponse = await api.get('/doctors');
      const doc = doctorsResponse.data.find(d => d.id === uuid);
      
      if (doc) {
        setDoctor({
          name: doc.name,
          clinic_name: doc.clinic_name,
          current_number: patientData.current_number,
        });
      } else {
        setError('Doctor not found');
      }
    } catch (err) {
      setError('Failed to load doctor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
  }, [uuid]);

  const handleIncrement = async () => {
    try {
      const response = await api.post(`/dr/${uuid}/increment`);
      setDoctor(prev => ({ ...prev, current_number: response.data.current_number }));
    } catch (err) {
      if (err.response?.data?.detail) {
        alert(err.response.data.detail);
      }
    }
  };

  const handleDecrement = async () => {
    try {
      const response = await api.post(`/dr/${uuid}/decrement`);
      setDoctor(prev => ({ ...prev, current_number: response.data.current_number }));
    } catch (err) {
      if (err.response?.data?.detail) {
        alert(err.response.data.detail);
      }
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the counter to 0?')) return;
    try {
      const response = await api.post(`/dr/${uuid}/reset`);
      setDoctor(prev => ({ ...prev, current_number: response.data.current_number }));
    } catch (err) {
      setError('Failed to reset counter');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8 text-gray-600">Loading...</div>;
  }

  if (error || !doctor) {
    return (
      <div className="flex justify-center p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Doctor not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-900 mb-2">{doctor.name}</h1>
            <p className="text-lg text-gray-600">{doctor.clinic_name}</p>
          </div>

          <div className="text-center mb-8">
            <p className="text-gray-500 mb-2 uppercase tracking-wide text-sm">Current Number</p>
            <div className="text-9xl font-bold text-blue-600">
              {doctor.current_number}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleDecrement}
              className="flex-1 sm:flex-none px-8 py-4 bg-red-500 text-white text-xl font-semibold rounded-lg hover:bg-red-600 transition-colors active:scale-95 touch-manipulation"
            >
              Previous (-)
            </button>
            <button
              onClick={handleIncrement}
              className="flex-1 sm:flex-none px-8 py-4 bg-green-500 text-white text-xl font-semibold rounded-lg hover:bg-green-600 transition-colors active:scale-95 touch-manipulation"
            >
              Next Patient (+)
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset to 0
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorControl;
