export const fetchUsers = async () => {
  const response = await fetch('http://localhost:3001/api/users');
  return await response.json();
};

export const fetchStudents = async () => {
  const response = await fetch('http://localhost:3001/api/students');
  return await response.json();
};

export const addStudent = async (studentData) => {
  const response = await fetch('http://localhost:3001/api/students', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(studentData)
  });
  return await response.json();
};

export const updateStudent = async (id, studentData) => {
  const response = await fetch(`http://localhost:3001/api/students/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(studentData)
  });
  return await response.json();
};

export const deleteStudent = async (id) => {
  const response = await fetch(`http://localhost:3001/api/students/${id}`, {
    method: 'DELETE'
  });
  return await response.json();
};

export const updateUser = async (id, userData) => {
  const response = await fetch(`http://localhost:3001/api/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });
  return await response.json();
};
