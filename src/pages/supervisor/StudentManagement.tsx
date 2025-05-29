import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { Download, UserPlus, Eye, Edit, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StudentFormDialog from '../../components/student/StudentFormDialog';
import DeleteStudentDialog from '../../components/student/DeleteStudentDialog';
import { useToast } from '@/hooks/use-toast';

const StudentManagement = () => {
  const { students, classes, exportStudentsData } = useData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const { toast } = useToast();
  
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.first_name.toLowerCase().includes(search.toLowerCase()) ||
      student.last_name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase()) ||
      student.student_id.toLowerCase().includes(search.toLowerCase());
      
    const matchesClass = classFilter === 'all' || student.class === classFilter;
    
    return matchesSearch && matchesClass;
  });
  
  const formatAbsenceCount = (student: any) => {
    const total = student.absences || 0;
    const justified = student.justified_absences || 0;
    
    return (
      <div>
        {total} <span className="text-xs text-muted-foreground">({justified} justified)</span>
      </div>
    );
  };



  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };

  const handleDeleteStudent = (student: any) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const handleExportData = () => {
    exportStudentsData();
    toast({
      title: "Données exportées",
      description: "Les données des étudiants ont été exportées en CSV avec succès.",
    });
  };

  const viewStudentDetails = (studentId: string) => {
    navigate(`/student-details/${studentId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor all students
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>

        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search by name, ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        

      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Students</TabsTrigger>
          <TabsTrigger value="warning" className="relative">
            Attendance Warning
            <span className="ml-1 rounded-full bg-amber-500 h-5 w-5 text-[10px] flex items-center justify-center text-white">
              {students.filter(s => (s.absences || 0) > 5).length}
            </span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Student List</CardTitle>
              <CardDescription>
                Manage and view all students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Absences</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student_id}</TableCell>
                      <TableCell>{student.first_name} {student.last_name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.department}</TableCell>
                      <TableCell>{student.year}</TableCell>
                      <TableCell>{formatAbsenceCount(student)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">

                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditStudent(student)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteStudent(student)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="warning">
          <Card>
            <CardHeader>
              <CardTitle>Students with Attendance Warnings</CardTitle>
              <CardDescription>
                Students with excessive absences that require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students
                  .filter(student => (student.absences || 0) > 5)
                  .map(student => (
                    <div key={student.id} className="p-4 border rounded-md flex justify-between items-center">
                      <div>
                        <div className="font-medium">{student.first_name} {student.last_name}</div>
                        <div className="text-sm">ID: {student.student_id} | Class {student.class}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.department} - {student.year}
                        </div>
                        <Badge variant="outline" className={`mt-2 ${(student.absences || 0) > 10 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                          {student.absences} Absences
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Contact</Button>
                        <Button 
                          size="sm" 
                          className="bg-emsi-green hover:bg-green-700"
                          onClick={() => viewStudentDetails(student.student_id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Student Dialog */}
      <StudentFormDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        mode="add"
      />
      
      {/* Edit Student Dialog */}
      {selectedStudent && (
        <StudentFormDialog 
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          studentData={selectedStudent}
          mode="edit"
        />
      )}
      
      {/* Delete Student Dialog */}
      {selectedStudent && (
        <DeleteStudentDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          student={selectedStudent}
        />
      )}
    </div>
  );
};

export default StudentManagement;
