import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

function DoctorControl() {
  const { uuid } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeAgoStr, setTimeAgoStr] = useState('جاري الحساب...');


  const parseServerDate = (dateString) => {
    const utcDateString = dateString.endsWith('Z') ? dateString : `${dateString}Z`;
    return new Date(utcDateString);
  };

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
        setLastUpdated(parseServerDate(patientData.updated_at));
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

  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeString = () => {
      const diffMinutes = Math.floor((new Date() - lastUpdated) / 60000);
      if (diffMinutes <= 0) setTimeAgoStr('الآن');
      else if (diffMinutes === 1) setTimeAgoStr('منذ دقيقة');
      else setTimeAgoStr(`منذ ${diffMinutes} دقيقة`);
    };

    updateTimeString();
    const interval = setInterval(updateTimeString, 60000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleAction = async (action) => {
    try {
      const response = await api.post(`/dr/${uuid}/${action}`);
      setDoctor(prev => ({ ...prev, current_number: response.data.current_number }));
      setLastUpdated(parseServerDate(response.data.updated_at));
    } catch (err) {
      if (err.response?.data?.detail) alert(err.response.data.detail);
    }
  };

  if (loading) return <div className="flex justify-center p-8 text-gray-600 font-bold">جاري التحميل...</div>;
  if (error || !doctor) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex flex-col items-center py-6">
        <div className="bg-white p-3 rounded-full shadow-sm mb-2 border border-blue-100">
          <div className="text-blue-900 font-bold text-xl">🏥</div>
        </div>
        <h1 className="text-2xl font-bold text-blue-900">المركز الطبي الجامعي</h1>
      </div>

      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative p-8">
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-1">{doctor.clinic_name}</h2>
            <p className="text-lg text-gray-700">الرقم الحالي</p>
          </div>

          {/* Number & Last Update */}
          <div className="flex justify-center items-center gap-8 mb-10">
             <div className="text-9xl font-extrabold text-blue-900 drop-shadow-md">
              {doctor.current_number}
            </div>
            <div className="text-right text-gray-500 text-sm leading-tight">
              آخر تحديث تم<br /> {timeAgoStr}
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => handleAction('increment')}
              className="w-full py-5 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white text-2xl font-bold rounded-2xl shadow-lg hover:opacity-90 transition-all flex justify-center items-center gap-3 active:scale-95 touch-manipulation"
            >
              الطلب التالي <span className="text-3xl">→</span>
            </button>

            <button
              onClick={() => handleAction('decrement')}
              className="w-full py-5 bg-gradient-to-r from-slate-800 to-slate-900 text-white text-2xl font-bold rounded-2xl shadow-lg hover:opacity-90 transition-all flex justify-center items-center gap-3 active:scale-95 touch-manipulation"
            >
              <span className="text-3xl">←</span> الطلب السابق
            </button>
          </div>

          <div className="mt-10 flex flex-col items-center">
            <button
              onClick={() => confirm('هل أنت متأكد من تصفير العداد؟') && handleAction('reset')}
              className="w-20 h-20 bg-white border-4 border-red-700 rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors active:scale-90 group touch-manipulation"
            >
              <div className="text-red-700 font-bold flex flex-col items-center">
                 <span className="text-2xl mt-1">🔄</span>
                 <span className="text-xs">0</span>
              </div>
            </button>
            <p className="mt-3 text-gray-600 font-bold">إعادة الترقيم إلى الصفر</p>
          </div>

        </div>
      </div>
      
      {/* الخلفية الزرقاء في الأسفل */}
      <div className="fixed bottom-0 left-0 right-0 h-1/4 bg-blue-900 -z-10 opacity-5 rounded-t-[100px]"></div>
    </div>
  );
}

export default DoctorControl;