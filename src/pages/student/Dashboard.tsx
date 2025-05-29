import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileText, CalendarDays } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#11a956', '#ff4d4f'];

const StudentDashboard = () => {
  const { user } = useAuth();
  const { absences, students, courses } = useData();
  console.log('Rendering StudentDashboard with user:', user);
  const [chartData, setChartData] = useState<any[]>([]);

  const student = students.find(s => s.user_id === user?.user_id);
  const studentId = student?.student_id;

  const studentAbsences = absences.filter(absence => absence.student_id === studentId);
  const justifiedCount = studentAbsences.filter(absence => absence.status === 'justified').length;
  const unjustifiedCount = studentAbsences.filter(absence => absence.status === 'unjustified').length;
  const pendingCount = studentAbsences.filter(absence => absence.status === 'pending').length;
  const totalCount = studentAbsences.filter(absence => absence.status === 'absent' || absence.status === 'pending' || absence.status === 'unjustified' || absence.status === 'justified').length;

  useEffect(() => {
    if (!student) {
      setChartData([]);
      return;
    }
    const totalClassesToStudy = courses.length * 10;
    const classesAttended = totalClassesToStudy - totalCount;

    const pieData = [
      { name: 'Classes Attended', value: classesAttended },
      { name: 'Classes Missed', value: totalCount },
    ];

    setChartData(pieData);
  }, [courses, student, totalCount]);

  // Removed the alert for unjustified absences as per user request

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenue, {user?.firstName}! Voici un aperçu de vos présences.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/timetable">
              <CalendarDays className="mr-2 h-4 w-4" />
              Voir l'emploi du temps
            </Link>
          </Button>
          <Button asChild>
            <Link to="/claim">
              <FileText className="mr-2 h-4 w-4" />
              Soumettre une réclamation
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des absences</CardTitle>
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
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">Ce semestre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Justifiées</CardTitle>
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{justifiedCount}</div>
            
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non justifiées</CardTitle>
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
            <div className="text-2xl font-bold">{unjustifiedCount}</div>
            <p className="text-xs text-muted-foreground">
              {unjustifiedCount > 0 ? 'Nécessite justification 48h' : 'Aucune absence non justifiée'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réclamations en attente</CardTitle>
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
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              {pendingCount > 0 ? 'En attente d&apos;approbation' : 'Aucune réclamation en attente'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Aperçu des présences</CardTitle>
            <CardDescription>Votre taux de présence par matière</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#11a956"
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}`, 'Classes']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Absences récentes</CardTitle>
            <CardDescription>Vos dernières absences enregistrées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentAbsences.length > 0 && studentAbsences[0].status !== 'present' ? (
                studentAbsences.slice(0, 5).map((absence) => (
                  <div key={absence.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{absence.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(absence.date).toLocaleDateString('fr-FR')} - {absence.time}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          absence.status === 'justified'
                            ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                            : absence.status === 'unjustified'
                            ? 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                        }`}
                      >
                        {absence.status === 'justified'
                          ? 'Justifiée'
                          : absence.status === 'unjustified'
                          ? 'Non justifiée'
                          : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Aucune absence enregistrée
                </p>
              )}

              {studentAbsences.length > 0 && (
                <div className="pt-2">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/absence-history">Voir tout l'historique</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
