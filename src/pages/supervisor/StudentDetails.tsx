
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Edit, BookOpen, Eye, CalendarX, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { students, absences, courses } = useData();
  const [student, setStudent] = useState<any>(null);
  const [studentAbsences, setStudentAbsences] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  
  useEffect(() => {
    // Find student by ID
    const foundStudent = students.find(s => s.id === id);
    if (foundStudent) {
      setStudent(foundStudent);
    }
    
    // Get student absences
    const studentAbs = absences.filter(abs => abs.studentId === id);
    setStudentAbsences(studentAbs);
    
    // Create attendance data
    const subjects = [
      'Mathematics', 'Physics', 'Computer Science', 
      'English', 'Programming', 'Networks'
    ];
    
    const attendanceBySubject = subjects.map(subject => {
      const totalClasses = Math.floor(Math.random() * 20) + 10;
      const absencesCount = studentAbs.filter(abs => 
        abs.subject.toLowerCase().includes(subject.toLowerCase())
      ).length;
      
      const attendanceRate = Math.round(((totalClasses - absencesCount) / totalClasses) * 100);
      
      return {
        subject: subject,
        attendance: attendanceRate,
        absences: absencesCount,
        total: totalClasses
      };
    });
    
    setAttendanceData(attendanceBySubject);
  }, [id, students, absences, courses]);
  
  if (!student) {
    return (
      <div className="text-center p-8">
        <p>Student not found</p>
        <Button asChild className="mt-4">
          <Link to="/student-management">Back to Student Management</Link>
        </Button>
      </div>
    );
  }
  
  const justifiedCount = studentAbsences.filter(a => a.status === 'justified').length;
  const unjustifiedCount = studentAbsences.filter(a => a.status === 'unjustified').length;
  const pendingCount = studentAbsences.filter(a => a.status === 'pending').length;

  const handleViewCourseDetails = (course: any) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  };

  const getCourseAbsences = (courseId: string) => {
    // For demo, we'll check if subject name contains course name
    return studentAbsences.filter(absence => 
      absence.subject.toLowerCase().includes(selectedCourse?.name.toLowerCase())
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/student-management">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
            <p className="text-muted-foreground">
              View and manage student information
            </p>
          </div>
        </div>
        
        <Button asChild>
          <Link to={`/student-management?edit=${id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Student
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4 pt-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={student.profileImage} alt={`${student.firstName} ${student.lastName}`} />
                <AvatarFallback className="text-2xl">
                  {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h2 className="text-xl font-bold">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-sm text-muted-foreground">Student ID: {student.studentId}</p>
                
                <div className="mt-2 flex justify-center">
                  <Badge className={`${
                    (student.absences || 0) > 10 
                      ? 'bg-red-100 text-red-800' 
                      : (student.absences || 0) > 5 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {(student.absences || 0) > 10 
                      ? 'High Absence Rate' 
                      : (student.absences || 0) > 5 
                        ? 'Moderate Absence Rate' 
                        : 'Good Attendance'}
                  </Badge>
                </div>
              </div>
              
              <div className="w-full pt-4 space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{student.email}</span>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{student.phoneNumber || '+212 6XX-XXXXXX'}</span>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{student.address || 'Casablanca, Morocco'}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Joined: {student.joinDate || 'Sep 2023'}</span>
                </div>
                
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">Department: {student.department}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Absences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{student.absences || studentAbsences.length}</div>
                <p className="text-xs text-muted-foreground">This semester</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Justified</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{justifiedCount}</div>
                <p className="text-xs text-muted-foreground">
                  {((justifiedCount / (student.absences || studentAbsences.length)) * 100).toFixed(0)}% of total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unjustified</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unjustifiedCount}</div>
                <p className="text-xs text-muted-foreground">
                  {((unjustifiedCount / (student.absences || studentAbsences.length)) * 100).toFixed(0)}% of total
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="attendance">
            <TabsList>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="absences">Absence History</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="attendance">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Overview</CardTitle>
                  <CardDescription>
                    Student's attendance rates by subject
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                      <Bar dataKey="attendance" fill="#11a956" name="Attendance Rate (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="absences">
              <Card>
                <CardHeader>
                  <CardTitle>Absence History</CardTitle>
                  <CardDescription>
                    Complete record of all absences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {studentAbsences.length > 0 ? (
                    <div className="space-y-4">
                      {studentAbsences.map((absence) => (
                        <div
                          key={absence.id}
                          className="p-4 border rounded-md flex justify-between items-center"
                        >
                          <div>
                            <div className="font-medium">{absence.subject}</div>
                            <div className="text-sm">
                              {new Date(absence.date).toLocaleDateString('en-US', { 
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })} - {absence.time || '10:00 AM - 12:00 PM'}
                            </div>
                            <div className="mt-1">
                              <Badge variant="outline" className={`
                                ${absence.status === 'justified' 
                                  ? 'bg-green-100 text-green-800' 
                                  : absence.status === 'unjustified' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {absence.status === 'justified' 
                                  ? 'Justified' 
                                  : absence.status === 'unjustified' 
                                    ? 'Unjustified' 
                                    : 'Pending'}
                              </Badge>
                            </div>
                          </div>
                          {absence.reason && (
                            <div className="text-sm text-muted-foreground max-w-[300px] text-right">
                              <span className="font-medium">Reason:</span> {absence.reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No absence history found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle>Enrolled Courses</CardTitle>
                  <CardDescription>
                    Courses the student is currently taking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courses.slice(0, 5).map((course) => (
                      <div
                        key={course.id}
                        className="p-4 border rounded-md"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium text-lg">{course.name}</div>
                            <div className="text-sm text-muted-foreground">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">Professor:</span> {course.professor}
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-4 w-4" />
                                <span>{course.day}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <Clock className="h-4 w-4" />
                                <span>{course.startTime} - {course.endTime}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>Room {course.room}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewCourseDetails(course)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                        
                        {/* Quick absence summary for the course */}
                        <div className="mt-4 bg-muted/40 p-3 rounded-md">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <CalendarX className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm font-medium">Absences in this course:</span>
                            </div>
                            <Badge variant="outline">
                              {studentAbsences.filter(absence => 
                                absence.subject.toLowerCase().includes(course.name.toLowerCase())
                              ).length || 0}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Course Details Dialog */}
      <Dialog open={showCourseDetails} onOpenChange={setShowCourseDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedCourse?.name} Details</DialogTitle>
            <DialogDescription>
              Detailed information and attendance record for this course
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourse && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Course Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="font-medium">Professor:</dt>
                        <dd>{selectedCourse.professor}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Schedule:</dt>
                        <dd>{selectedCourse.day}, {selectedCourse.startTime} - {selectedCourse.endTime}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Room:</dt>
                        <dd>{selectedCourse.room}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Department:</dt>
                        <dd>{student.department}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Attendance Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      {(() => {
                        const courseAbsences = studentAbsences.filter(absence => 
                          absence.subject.toLowerCase().includes(selectedCourse.name.toLowerCase())
                        );
                        const totalSessions = Math.floor(Math.random() * 15) + 10; // Mock data
                        const attendedSessions = totalSessions - courseAbsences.length;
                        const attendanceRate = ((attendedSessions / totalSessions) * 100).toFixed(1);
                        
                        return (
                          <>
                            <div className="flex justify-between">
                              <dt className="font-medium">Total Sessions:</dt>
                              <dd>{totalSessions}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Attended:</dt>
                              <dd>{attendedSessions}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Absences:</dt>
                              <dd>{courseAbsences.length}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="font-medium">Attendance Rate:</dt>
                              <dd className={`font-bold ${
                                Number(attendanceRate) < 70 
                                  ? 'text-red-600' 
                                  : Number(attendanceRate) < 85 
                                    ? 'text-amber-600' 
                                    : 'text-green-600'
                              }`}>{attendanceRate}%</dd>
                            </div>
                          </>
                        );
                      })()}
                    </dl>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Absence Records</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const courseAbsences = studentAbsences.filter(absence => 
                      absence.subject.toLowerCase().includes(selectedCourse.name.toLowerCase())
                    );
                    
                    return courseAbsences.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {courseAbsences.map((absence) => (
                            <TableRow key={absence.id}>
                              <TableCell>
                                {new Date(absence.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </TableCell>
                              <TableCell>{absence.time}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`
                                  ${absence.status === 'justified' 
                                    ? 'bg-green-100 text-green-800' 
                                    : absence.status === 'unjustified' 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {absence.status === 'justified' 
                                    ? 'Justified' 
                                    : absence.status === 'unjustified' 
                                      ? 'Unjustified' 
                                      : 'Pending'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {absence.reason || 'Not specified'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">No absences recorded for this course</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetails;
