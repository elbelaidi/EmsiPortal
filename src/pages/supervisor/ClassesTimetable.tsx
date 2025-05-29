
import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, PlusCircle, FileEdit, Printer, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';

const ClassesTimetable = () => {
  const { classes, courses, exportStudentsData, addTimetableSession, updateTimetableSession, deleteTimetableSession } = useData();
  const [selectedClass, setSelectedClass] = useState('all');
  const { toast } = useToast();
  const timetableRef = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState({
    id: '',
    day: '',
    startTime: '',
    endTime: '',
    name: '',
    professor: '',
    room: '',
    department: '',
    year: ''
  });
  const [isAddMode, setIsAddMode] = useState(false);
  
  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  
  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  
  // Prepare timetable data from courses
  const [timetableData, setTimetableData] = useState<Record<string, Record<string, any>>>({});
  
  useEffect(() => {
    // Transform courses into timetable data format
    const data: Record<string, Record<string, any>> = {};
    
    days.forEach(day => {
      data[day] = {};
    });

    let filteredCourses = courses;
    if (selectedClass !== 'all') {
      const selectedClassObj = classes.find(cls => cls.name === selectedClass);
      if (selectedClassObj) {
        filteredCourses = courses.filter(course => 
          course.department === selectedClassObj.department && 
          course.year === selectedClassObj.year
        );
      } else {
        filteredCourses = [];
      }
    }
    
    filteredCourses.forEach(course => {
      if (!data[course.day]) {
        data[course.day] = {};
      }
      
      data[course.day][course.start_time] = {
        id: course.id,
        subject: course.name,
        professor: course.professor,
        room: course.room,
        endTime: course.end_time
      };
    });
    
    setTimetableData(data);
  }, [courses, selectedClass, classes]);

  const handleAddCourse = () => {
    setIsAddMode(true);
    setEditingCourse({
      id: '',
      day: days[0],
      startTime: timeSlots[0],
      endTime: timeSlots[1],
      name: '',
      professor: '',
      room: '',
      department: '',
      year: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditCourse = (day: string, time: string, course: any) => {
    if (!course) {
      // Create new course
      setIsAddMode(true);
      setEditingCourse({
        id: '',
        day,
        startTime: time,
        endTime: calculateEndTime(time),
        name: '',
        professor: '',
        room: '',
        department: '',
        year: ''
      });
    } else {
      // Edit existing course
      setIsAddMode(false);
      // Find the class that matches the course's department and year
      const matchedClass = classes.find(cls => cls.department === course.department && cls.year === course.year);
      setEditingCourse({
        id: course.id,
        day,
        startTime: time,
        endTime: course.endTime,
        name: course.subject,
        professor: course.professor,
        room: course.room,
        department: course.department,
        year: course.year
      });
    }
    setIsDialogOpen(true);
  };

  const handleDeleteCourse = () => {
    if (editingCourse.id) {
      deleteTimetableSession(editingCourse.id);
      
      toast({
        title: "Cours supprimé",
        description: `${editingCourse.name} a été supprimé avec succès.`,
      });
      
      setIsDeleteDialogOpen(false);
      setIsDialogOpen(false);
    }
  };

  const handleSaveCourse = () => {
    if (isAddMode) {
      // Add new course
      const newCourse = {
        day: editingCourse.day,
        start_time: editingCourse.startTime,
        end_time: editingCourse.endTime,
        name: editingCourse.name,
        professor: editingCourse.professor,
        room: editingCourse.room,
        department: editingCourse.department,
        year: editingCourse.year
      };
      
      addTimetableSession(newCourse);
      
      toast({
        title: "Cours ajouté",
        description: `${editingCourse.name} a été ajouté avec succès.`,
      });
    } else {
      // Update existing course
      const updatedCourse = {
        id: editingCourse.id,
        day: editingCourse.day,
        start_time: editingCourse.startTime,
        end_time: editingCourse.endTime,
        name: editingCourse.name,
        professor: editingCourse.professor,
        room: editingCourse.room,
        department: editingCourse.department,
        year: editingCourse.year
      };
      
      updateTimetableSession(updatedCourse);
      
      toast({
        title: "Cours mis à jour",
        description: `${editingCourse.name} a été mis à jour avec succès.`,
      });
    }
    
    setIsDialogOpen(false);
  };

  const calculateEndTime = (startTime: string): string => {
    const hour = parseInt(startTime.split(':')[0]);
    return `${(hour + 1).toString().padStart(2, '0')}:00`;
  };

  const handlePrintTimetable = () => {
    window.print();
    toast({
      title: "Impression en cours",
      description: "L'emploi du temps est en cours d'impression.",
    });
  };

  const handleExportPDF = async () => {
    if (timetableRef.current) {
      toast({
        title: "Préparation du PDF",
        description: "L'emploi du temps est en cours d'exportation...",
      });
      
      try {
        const canvas = await html2canvas(timetableRef.current);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`emploi-du-temps-${selectedClass === 'all' ? 'toutes-classes' : selectedClass}.pdf`);
        
        toast({
          title: "PDF exporté",
          description: "L'emploi du temps a été exporté en PDF avec succès.",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de l'exportation. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    }
  };

  const handleExportStudentsCSV = () => {
    exportStudentsData();
    toast({
      title: "Données exportées",
      description: "Les données des étudiants ont été exportées en CSV avec succès.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emploi du Temps</h1>
          <p className="text-muted-foreground">
            Consultez et gérez les emplois du temps des classes
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handlePrintTimetable}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Exporter PDF
          </Button>
          <Button variant="outline" onClick={handleExportStudentsCSV}>
            <FileText className="mr-2 h-4 w-4" />
            Exporter CSV
          </Button>

        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-full sm:w-64">
          <p className="mb-2 text-sm font-medium">Classe</p>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une classe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les classes</SelectItem>
              {classes.map((cls) => (
          <SelectItem key={cls.id} value={cls.name}>
            {cls.name}
          </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Emploi du Temps - {selectedClass === 'all' ? 'Toutes les classes' : `Classe ${selectedClass}`}</CardTitle>
          <CardDescription>
            Semestre en cours: Automne 2024-2025
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto" ref={timetableRef}>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border bg-muted font-medium">Horaire</th>
                  {days.map(day => (
                    <th key={day} className="p-2 border bg-muted font-medium">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time}>
                    <td className="p-2 border font-medium bg-muted">{time}</td>
                    {days.map(day => {
                      const course = timetableData[day]?.[time];
                      return (
                        <td 
                          key={`${day}-${time}`} 
                          className="p-2 border cursor-pointer hover:bg-muted"
                          onClick={() => handleEditCourse(day, time, course)}
                        >
                          {course ? (
                            <div className="min-h-16 flex flex-col">
                              <div className="font-medium">{course.subject}</div>
                              <div className="text-xs">{course.professor}</div>
                              <div className="text-xs mt-auto">Salle: {course.room}</div>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Course Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isAddMode ? "Ajouter un cours" : "Modifier un cours"}</DialogTitle>
            <DialogDescription>
              {isAddMode 
                ? "Ajoutez les détails du nouveau cours. Cliquez sur sauvegarder lorsque vous avez terminé."
                : "Modifiez les détails du cours. Cliquez sur sauvegarder lorsque vous avez terminé."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day" className="text-right">
                Jour
              </Label>
              <Select 
                value={editingCourse.day} 
                onValueChange={(value) => setEditingCourse({...editingCourse, day: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un jour" />
                </SelectTrigger>
                <SelectContent>
                  {days.map(day => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Heure début
              </Label>
              <Select 
                value={editingCourse.startTime} 
                onValueChange={(value) => setEditingCourse({
                  ...editingCourse, 
                  startTime: value,
                  endTime: calculateEndTime(value)
                })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une heure" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                Heure fin
              </Label>
              <Input
                id="endTime"
                value={editingCourse.endTime}
                disabled
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Matière
              </Label>
              <Input
                id="name"
                value={editingCourse.name}
                onChange={(e) => setEditingCourse({...editingCourse, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="professor" className="text-right">
                Professeur
              </Label>
              <Input
                id="professor"
                value={editingCourse.professor}
                onChange={(e) => setEditingCourse({...editingCourse, professor: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="room" className="text-right">
                Salle
              </Label>
              <Input
                id="room"
                value={editingCourse.room}
                onChange={(e) => setEditingCourse({...editingCourse, room: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            {!isAddMode && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </Button>
            )}
            <Button type="submit" onClick={handleSaveCourse}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce cours?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement le cours 
              "{editingCourse.name}" du programme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClassesTimetable;
