import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

function PatientView() {
  const { uuid } = useParams();
  const [clinicName, setClinicName] = useState('');
  const [currentNumber, setCurrentNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await api.get(`/patient/${uuid}`);
      setClinicName(response.data.clinic_name);
      setCurrentNumber(response.data.current_number);
      setError(null);
    } catch (err) {
      setError('Doctor not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [uuid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <p className="text-gray-600 text-xl md:text-2xl mb-4">
          Now Serving at <span className="font-semibold text-blue-900">{clinicName}</span>
        </p>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-16">
          <div className="text-9xl md:text-[12rem] font-bold text-blue-600 leading-none">
            {currentNumber}
          </div>
        </div>

        <p className="text-gray-400 mt-6 text-sm">Updates automatically every 5 seconds</p>
      </div>
    </div>
  );
}

export default PatientView;
