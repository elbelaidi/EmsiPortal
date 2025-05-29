import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const SupervisorDashboard = () => {
  const { user } = useAuth();
  const { absences, classes, students, courses, loading, error } = useData();
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  
  const totalStudents = students.length;
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  const justifiedCount = absences.filter(absence => absence.status === 'justified').length;
  const unjustifiedCount = absences.filter(absence => absence.status === 'unjustified').length;
  const pendingCount = absences.filter(absence => absence.status === 'pending').length;

  useEffect(() => {
    if (loading) return;

    // Generate class attendance data based on student data and absences
    const classData = classes.map(cls => {
      const studentsInClass = students.filter(s => cls.students.includes(s.id));
      const studentIdsInClass = studentsInClass.map(s => s.id);
      const totalAbsencesInClass = absences.filter(absence => studentIdsInClass.includes(absence.student_id)).length;
      const totalStudentCourses = studentsInClass.length * courses.length; 
      
      // Calculate attendance percentage (inverted absence rate)
      const attendanceRate = totalStudentCourses === 0 
        ? 100 
        : Math.round(100 - (totalAbsencesInClass / totalStudentCourses * 100));
      
      return {
        className: cls.name,
        attendance: attendanceRate,
        students: studentsInClass.length
      };
    });
    
    // Absence type data for pie chart
    const totalAbsences = absences.length;
    const presentCount = absences.filter(absence => absence.status === 'present').length;
    const noAbsencesValue = Math.max(0, totalAbsences - presentCount);
    
    const absenceData = [
      { name: 'Absent', value: totalAbsences - presentCount },
      { name: 'Present', value: presentCount }
    ];
    
    setChartData(classData);
    setPieData(absenceData);
  }, [absences, classes, students, courses, loading]);

const today = new Date();
const absencesToday = absences.filter(absence => {
  const absenceDate = new Date(absence.date);
  return (
    absenceDate.getFullYear() === today.getFullYear() &&
    absenceDate.getMonth() === today.getMonth() &&
    absenceDate.getDate() === today.getDate() &&
    (absence.status === 'absent' || absence.status === 'unjustified')
  );
}).length;

const totalPossibleAttendance = totalStudents * courses.length;
const totalAbsences = unjustifiedCount + pendingCount;
const attendanceRate = totalPossibleAttendance === 0 
  ? 100 
  : Math.round(100 - (totalAbsences / totalPossibleAttendance * 100));

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supervisor Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName}! Here's your overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/classes-timetable">
              <Calendar className="mr-2 h-4 w-4" />
              View Timetables
            </Link>
          </Button>
          <Button className="bg-emsi-green hover:bg-green-700" asChild>
            <Link to="/track-absences">
              <Clock className="mr-2 h-4 w-4" />
              Track Absences
            </Link>
          </Button>
        </div>
      </div>
      
      {/* New Claims Alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <Bell className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800">New Claims</h3>
            <p className="text-sm text-amber-700">
              You have {pendingCount} new absence claims that require your review.
              <Button asChild variant="link" className="p-0 h-auto text-amber-800 font-medium ml-2">
                <Link to="/track-absences">Review claims now</Link>
              </Button>
            </p>
          </div>
        </div>
      )}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Across {classes.length} classes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              {pendingCount > 0 ? `${pendingCount} claims to review` : 'No pending claims'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Absences</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unjustifiedCount + pendingCount}</div>
            <p className="text-xs text-muted-foreground">Across all classes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Overall attendance rate
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Total Students', value: totalStudents },
                  { name: 'Pending Claims', value: pendingCount },
                  { name: 'Total Absences', value: unjustifiedCount + pendingCount },
                  { name: 'Attendance Rate', value: attendanceRate }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#11a956" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Absence Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default SupervisorDashboard;
