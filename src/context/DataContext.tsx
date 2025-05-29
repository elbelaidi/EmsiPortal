import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { useAuth } from './AuthContext';

type Absence = {
  id: string;
  student_id: string;
  subject: string;
  date: string;
  time: string;
  status: 'absent' | 'present' | 'pending' | 'justified' | 'unjustified';
  reason?: string;
  description?: string;
  document_url?: string;
  submitted_on?: string;
};

type Class = {
  id: string;
  name: string;
  department: string;
  year: string;
  students: string[];
};

type Course = {
  id: string;
  name: string;
  room: string;
  day: string;
  start_time: string;
  end_time: string;
  professor: string;
  department: string;
  year: string;
};

type Student = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_id: string;
  department: string;
  year: string;
  class: string;
  phone_number?: string;
  address?: string;
  profile_image?: string;
  absences: number;
  justified_absences: number;
  join_date: string;
  user_id: string;
};

type ChatMessage = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
};

interface DataContextType {
  absences: Absence[];
  classes: Class[];
  courses: Course[];
  students: Student[];
  chatMessages: ChatMessage[];
  addAbsenceClaim: (absence: Omit<Absence, 'id' | 'status'>) => Promise<void>;
updateAbsenceStatus: (id: string, status: 'absent' | 'present' | 'pending' | 'justified' | 'unjustified') => Promise<void>;
  sendChatMessage: (message: string, role?: string) => void;
  addStudent: (student: Omit<Student, 'id' | 'absences' | 'justified_absences' | 'join_date'>) => Promise<void>;
  updateStudent: (studentId: string, studentData: Partial<Student>) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  addTimetableSession: (course: Omit<Course, 'id'>) => Promise<void>;
  updateTimetableSession: (course: Course) => Promise<void>;
  deleteTimetableSession: (courseId: string) => Promise<void>;
  exportStudentsData: () => void;
  updateUserProfile: (userId: string, profileData: Partial<User>) => Promise<User>;
  updateProfilePicture: (userId: string, pictureUrl: string) => Promise<void>;
  updatePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<void>;
  setAbsences: (absences: Absence[]) => void;
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType>({
  absences: [],
  classes: [],
  courses: [],
  students: [],
  chatMessages: [],
  addAbsenceClaim: async () => {},
  updateAbsenceStatus: async () => {},
  sendChatMessage: () => {},
  addStudent: async () => {},
  updateStudent: async () => {},
  deleteStudent: async () => {},
  addTimetableSession: async () => {},
  updateTimetableSession: async () => {},
  deleteTimetableSession: async () => {},
  exportStudentsData: () => {},
  updateUserProfile: async () => ({ user_id: '', email: '', firstName: '', lastName: '', role: 'student' }),
  updateProfilePicture: async () => {},
  updatePassword: async () => {},
  setAbsences: () => {},
  loading: false,
  error: null
});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const classesRes = await fetch('http://localhost:3001/api/classes');
        const studentsRes = await fetch('http://localhost:3001/api/students');

        if (!classesRes.ok || !studentsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const classesData = await classesRes.json();
        const studentsData = await studentsRes.json();

        setClasses(classesData);
        setStudents(studentsData);

        if (user) {
          if (user.role === 'supervisor') {
            const absencesRes = await fetch(`http://localhost:3001/api/absences`);
            if (!absencesRes.ok) {
              throw new Error('Failed to fetch absences for supervisor');
            }
            const absencesData = await absencesRes.json();
            setAbsences(absencesData);

            const coursesRes = await fetch(`http://localhost:3001/api/courses`);
            if (!coursesRes.ok) {
              throw new Error('Failed to fetch courses for supervisor');
            }
            const coursesData = await coursesRes.json();
            setCourses(coursesData);
          } else {
            const student = studentsData.find(s => s.user_id === user.user_id);
            if (student) {
              const absencesRes = await fetch(`http://localhost:3001/api/students/${student.student_id}/absences`);
              if (!absencesRes.ok) {
                throw new Error('Failed to fetch absences for student');
              }
              const absencesData = await absencesRes.json();
              setAbsences(absencesData);

              const coursesRes = await fetch(`http://localhost:3001/api/students/${student.student_id}/courses`);
              if (!coursesRes.ok) {
                throw new Error('Failed to fetch courses for student');
              }
              const coursesData = await coursesRes.json();
              setCourses(coursesData);
            } else {
              setAbsences([]);
              setCourses([]);
            }
          }
        } else {
          setAbsences([]);
          setCourses([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Other functions unchanged...

  return (
    <DataContext.Provider value={{
        absences,
        classes,
        courses,
        students,
        chatMessages,
        addAbsenceClaim: async (absence: Omit<Absence, 'id' | 'status'>) => {
          try {
            const response = await fetch('http://localhost:3001/api/absences', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(absence)
            });
            if (!response.ok) throw new Error('Failed to add absence claim');
            const newAbsence = await response.json();
            setAbsences(prev => [...prev, newAbsence]);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add absence claim');
            throw err;
          }
        },
updateAbsenceStatus: async (id: string, status: 'absent' | 'present' | 'pending' | 'justified' | 'unjustified') => {
  try {
    const response = await fetch(`http://localhost:3001/api/absences/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to update absence status');
    const updatedAbsence = await response.json();
    setAbsences(prev => prev.map(a => a.id === id ? updatedAbsence : a));
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to update absence status');
    throw err;
  }
},
        sendChatMessage: (message: string, role = 'student') => {
          const newMessage: ChatMessage = {
            id: Date.now().toString(),
            text: message,
            sender: 'user',
            timestamp: new Date().toISOString()
          };
          setChatMessages(prev => [...prev, newMessage]);
        },
        addStudent: async (student: Omit<Student, 'id' | 'absences' | 'justified_absences' | 'join_date'>) => {
          try {
            const response = await fetch('http://localhost:3001/api/students', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(student)
            });
            if (!response.ok) throw new Error('Failed to add student');
            const newStudent = await response.json();
            setStudents(prev => [...prev, newStudent]);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add student');
            throw err;
          }
        },
        updateStudent: async (studentId: string, studentData: Partial<Student>) => {
          try {
            const response = await fetch(`http://localhost:3001/api/students/${studentId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(studentData)
            });
            if (!response.ok) throw new Error('Failed to update student');
            const updatedStudent = await response.json();
            setStudents(prev => prev.map(s => s.student_id === studentId ? updatedStudent : s));
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update student');
            throw err;
          }
        },
        deleteStudent: async (studentId: string) => {
          try {
            const response = await fetch(`http://localhost:3001/api/students/${studentId}`, {
              method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete student');
            setStudents(prev => prev.filter(s => s.student_id !== studentId));
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete student');
            throw err;
          }
        },
        addTimetableSession: async (course: Omit<Course, 'id'>) => {
          try {
            const response = await fetch('http://localhost:3001/api/courses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(course)
            });
            if (!response.ok) throw new Error('Failed to add course');
            const newCourse = await response.json();
            setCourses(prev => [...prev, newCourse]);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add course');
            throw err;
          }
        },
        updateTimetableSession: async (course: Course) => {
          try {
            const response = await fetch(`http://localhost:3001/api/courses/${course.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(course)
            });
            if (!response.ok) throw new Error('Failed to update course');
            const updatedCourse = await response.json();
            setCourses(prev => prev.map(c => c.id === course.id ? updatedCourse : c));
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update course');
            throw err;
          }
        },
        deleteTimetableSession: async (courseId: string) => {
          try {
            const response = await fetch(`http://localhost:3001/api/courses/${courseId}`, {
              method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete course');
            setCourses(prev => prev.filter(c => c.id !== courseId));
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete course');
            throw err;
          }
        },
        exportStudentsData: () => {
          try {
            const csvContent = [
              ['ID', 'First Name', 'Last Name', 'Email', 'Department', 'Year', 'Class', 'Absences', 'Justified Absences'],
              ...students.map(student => [
                student.student_id,
                student.first_name,
                student.last_name,
                student.email,
                student.department,
                student.year,
                student.class,
                student.absences,
                student.justified_absences
              ])
            ].map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'students_data.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to export student data');
          }
        },
        updateUserProfile: async (userId: string, profileData: Partial<User>) => {
          try {
            const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
                phoneNumber: profileData.phoneNumber,
                address: profileData.address
              })
            });
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to update user profile');
            }
            const updatedUser = await response.json();
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              const currentUser = JSON.parse(storedUser);
              const newUserData = { ...currentUser, ...updatedUser };
              localStorage.setItem('user', JSON.stringify(newUserData));
            }
            return updatedUser;
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update user profile');
            throw err;
          }
        },
        updateProfilePicture: async (userId: string, pictureUrl: string) => {
          try {
            const response = await fetch(`http://localhost:3001/api/users/${userId}/profile-picture`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ profile_image: pictureUrl })
            });
            if (!response.ok) throw new Error('Failed to update profile picture');
            const updatedUser = await response.json();
            setStudents(prev => prev.map(s => s.user_id === userId ? { ...s, profile_image: pictureUrl } : s));
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile picture');
            throw err;
          }
        },
        updatePassword: async (userId: string, currentPassword: string, newPassword: string) => {
          try {
            const response = await fetch(`http://localhost:3001/api/users/${userId}/password`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ currentPassword, newPassword })
            });
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to update password');
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update password');
            throw err;
          }
        },
        setAbsences,
        loading,
        error
    }}>
      {children}
    </DataContext.Provider>
  );
};
