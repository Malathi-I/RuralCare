import { useCallback, useEffect, useState } from 'react';
import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from '../services/appointmentService.js';

/**
 * Loads the appointments assigned to the logged in doctor.
 * Shared by the doctor dashboard, today's list, upcoming list and
 * the management screen so the data is fetched the same way everywhere.
 */
export default function useDoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getDoctorAppointments();
      setAppointments(data.appointments);
    } catch (requestError) {
      setError(requestError.userMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const changeStatus = async (id, status) => {
    setError('');

    try {
      await updateAppointmentStatus(id, status);
      await reload();
      return true;
    } catch (requestError) {
      setError(requestError.userMessage);
      return false;
    }
  };

  return { appointments, loading, error, reload, changeStatus };
}