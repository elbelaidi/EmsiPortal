import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type StudentFormProps = {
  isOpen: boolean;
  onClose: () => void;
  studentData?: any;
  mode: 'add' | 'edit';
};

const StudentFormDialog = ({ isOpen, onClose, studentData, mode }: StudentFormProps) => {
  const { addStudent, updateStudent, classes } = useData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    first_name: studentData?.first_name || '',
    last_name: studentData?.last_name || '',
    email: studentData?.email || '',
    student_id: studentData?.student_id || '',
    department: studentData?.department || 'Informatique',
    year: studentData?.year || '3ème année',
    class: studentData?.class || 'GI3',
    phone_number: studentData?.phone_number || '',
    address: studentData?.address || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'add') {
        await addStudent(formData);
        toast({
          title: "Student added",
          description: "The student has been added successfully",
        });
      } else {
        await updateStudent(studentData.student_id, formData);
        toast({
          title: "Student updated",
          description: "The student information has been updated",
        });
      }
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add Student' : 'Edit Student'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Fill in the information to add a new student.' 
              : 'Edit the student information.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="student_id">Student ID</Label>
            <Input
              id="student_id"
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleSelectChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Informatique">Computer Science</SelectItem>
                  <SelectItem value="Génie Électrique">Electrical Engineering</SelectItem>
                  <SelectItem value="Génie Civil">Civil Engineering</SelectItem>
                  <SelectItem value="Génie Mécanique">Mechanical Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select
                value={formData.year}
                onValueChange={(value) => handleSelectChange('year', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1ère année">1st Year</SelectItem>
                  <SelectItem value="2ème année">2nd Year</SelectItem>
                  <SelectItem value="3ème année">3rd Year</SelectItem>
                  <SelectItem value="4ème année">4th Year</SelectItem>
                  <SelectItem value="5ème année">5th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select
              value={formData.class}
              onValueChange={(value) => handleSelectChange('class', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.name}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          
          <DialogFooter>
            <Button type="submit">
              {mode === 'add' ? 'Add Student' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentFormDialog;
