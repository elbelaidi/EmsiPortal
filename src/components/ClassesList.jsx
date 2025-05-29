import React, { useEffect, useState } from 'react';
import { fetchClasses } from '../api';
import './ClassesList.css';

const ClassesList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await fetch('/api/classes', {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch classes');
        }
        const data = await response.json();
        setClasses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadClasses();
  }, []);

  if (loading) return <div className="loading">Loading classes...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="classes-list">
      <h2>Classes</h2>
      {classes.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Academic Year</th>
            </tr>
          </thead>
          <tbody>
            {classes.map(cls => (
              <tr key={cls.class_id}>
                <td>{cls.class_id}</td>
                <td>{cls.name}</td>
                <td>{cls.department}</td>
                <td>{cls.academic_year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No classes found in the database</p>
      )}
    </div>
  );
};

export default ClassesList;
