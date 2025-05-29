import { useState, useRef, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, ListIcon, FileDown, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const Timetable = () => {
  const { courses, classes, loading, error } = useData();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedClass, setSelectedClass] = useState('all');
  const { toast } = useToast();
  const timetableRef = useRef(null);

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

  const HOURS = useMemo(() => {
    const hoursSet = new Set<string>();
    filteredCourses.forEach(course => {
      if (course.start_time) {
        hoursSet.add(course.start_time.slice(0, 5));
      }
    });
    return Array.from(hoursSet).sort();
  }, [filteredCourses]);

  const handlePrintTimetable = () => {
    window.print();
    toast({
      title: "Impression en cours",
      description: "Votre emploi du temps est en cours d'impression.",
    });
  };

  const handleExportPDF = async () => {
    if (timetableRef.current) {
      toast({
        title: "Préparation du PDF",
        description: "Votre emploi du temps est en cours d'exportation...",
      });

      try {
        const canvas = await html2canvas(timetableRef.current);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('l', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('mon-emploi-du-temps.pdf');

        toast({
          title: "PDF exporté",
          description: "Votre emploi du temps a été exporté en PDF avec succès.",
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

  const renderGridView = () => {
    return (
      <div className="overflow-x-auto" ref={timetableRef}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2 bg-muted">Heures</th>
              {DAYS.map((day) => (
                <th key={day} className="border p-2 bg-muted">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour}>
                <td className="border p-2 font-medium bg-muted">{hour}</td>
                {DAYS.map((day) => {
                  const coursesAtTime = courses.filter(
                    (course) => course.day === day && course.start_time.slice(0,5) === hour
                  );

                  return (
                    <td key={day} className="timetable-cell border p-2 min-h-[80px] h-24 align-top">
                      {coursesAtTime.length > 0
                        ? coursesAtTime.map((course) => (
                            <div key={course.id} className="bg-card shadow-sm rounded p-2 h-full flex flex-col">
                              <div className="font-medium">{course.name}</div>
                              <div className="text-xs mt-auto">
                                {course.room} • {course.professor}
                              </div>
                            </div>
                          ))
                        : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-4" ref={timetableRef}>
        {DAYS.map((day) => {
          const dayClasses = courses.filter((course) => course.day === day);

          if (dayClasses.length === 0) return null;

          return (
            <Card key={day} className="overflow-hidden">
              <div className="bg-muted p-3 font-medium">{day}</div>
              <div className="divide-y">
                {dayClasses
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map((course) => (
                    <div key={course.id} className="p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{course.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {course.room} • {course.professor}
                        </div>
                      </div>
                      <div className="text-sm">
                        {course.start_time} - {course.end_time}
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Emploi du temps</h1>
          <p className="text-muted-foreground">
            Consultez votre emploi du temps hebdomadaire
          </p>
        </div>
        <div className="flex gap-2">
          <div className="hidden md:flex">
            <Button variant="outline" size="sm" onClick={() => setView('grid')}>
              <CalendarDays className="h-4 w-4 mr-2" />
              Vue en grille
            </Button>
            <Button variant="outline" size="sm" onClick={() => setView('list')}>
              <ListIcon className="h-4 w-4 mr-2" />
              Vue en liste
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrintTimetable}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </div>
      
      <div className="md:hidden">
        <Tabs defaultValue="grid" onValueChange={(v) => setView(v as 'grid' | 'list')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Vue en grille</TabsTrigger>
            <TabsTrigger value="list">Vue en liste</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="bg-card rounded-lg border p-4">
        {courses.length > 0 ? (
          <>
            <div className="font-medium text-lg mb-3">
              {courses[0].department} - {courses[0].year}
            </div>
            {view === 'grid' ? renderGridView() : renderListView()}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Aucun cours n'est programmé pour le moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default Timetable;
