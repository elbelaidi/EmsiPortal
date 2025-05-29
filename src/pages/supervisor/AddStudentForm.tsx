import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { useData } from '../../context/DataContext';

const AddStudentForm = () => {
  const { toast } = useToast();
  const { addStudent } = useData(); // Assuming this function exists in your context
  const [studentData, setStudentData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    department: '',
    year: '',
    class: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addStudent(studentData); // Call the function to add student
      toast({
        title: "Étudiant ajouté",
        description: "L'étudiant a été ajouté avec succès.",
      });
      setStudentData({
        firstName: '',
        lastName: '',
        email: '',
        studentId: '',
        department: '',
        year: '',
        class: '',
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout de l'étudiant.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="firstName">Prénom</Label>
        <Input
          id="firstName"
          name="firstName"
          value={studentData.firstName}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="lastName">Nom</Label>
        <Input
          id="lastName"
          name="lastName"
          value={studentData.lastName}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={studentData.email}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="studentId">ID Étudiant</Label>
        <Input
          id="studentId"
          name="studentId"
          value={studentData.studentId}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="department">Département</Label>
        <Input
          id="department"
          name="department"
          value={studentData.department}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="year">Année</Label>
        <Input
          id="year"
          name="year"
          value={studentData.year}
          onChange={handleChange}
        />
      </div>
      <div>
        <Label htmlFor="class">Classe</Label>
        <Input
          id="class"
          name="class"
          value={studentData.class}
          onChange={handleChange}
        />
      </div>
      <Button type="submit">Ajouter Étudiant</Button>
    </form>
  );
};

export default AddStudentForm;
