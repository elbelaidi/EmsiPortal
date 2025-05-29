
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search } from 'lucide-react';

const AbsenceHistory = () => {
  const { user } = useAuth();
  const { absences, students } = useData();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const student = students.find(s => s.user_id === user?.user_id);
  const studentId = student?.student_id;

  const studentAbsences = absences.filter(absence => absence.student_id === studentId);

  const filteredAbsences = studentAbsences.filter(absence => {
    const matchesSearch =
      absence.subject.toLowerCase().includes(search.toLowerCase()) ||
      absence.date.toLowerCase().includes(search.toLowerCase());

    if (filter === 'all') return matchesSearch;
    return matchesSearch && absence.status === filter;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'justified': return 'Justifiée';
      case 'unjustified': return 'Non justifiée';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'justified':
        return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400';
      case 'unjustified':
        return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique des absences</h1>
          <p className="text-muted-foreground">
            Consultez et suivez toutes vos absences
          </p>
        </div>
        <Button asChild>
          <Link to="/claim">
            <FileText className="mr-2 h-4 w-4" />
            Soumettre une réclamation
          </Link>
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par matière ou date..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Toutes les absences" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les absences</SelectItem>
            <SelectItem value="justified">Justifiées</SelectItem>
            <SelectItem value="unjustified">Non justifiées</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="all" className="flex-1">Tout</TabsTrigger>
          <TabsTrigger value="current" className="flex-1">Semestre actuel</TabsTrigger>
          <TabsTrigger value="previous" className="flex-1">Semestres précédents</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="rounded-md border">
            <div className="p-4 space-y-4">
              <h3 className="text-xl font-semibold">Toutes les absences</h3>
              <p className="text-sm text-muted-foreground">Historique complet de vos absences</p>
            </div>

            {filteredAbsences.length > 0 ? (
              <div className="divide-y">
                {filteredAbsences.map((absence) => (
                  <div key={absence.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{absence.subject}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(absence.date).toLocaleDateString('fr-FR')} - {absence.time}
                        </p>
                        {absence.reason && (
                          <p className="text-sm mt-1">
                            Motif: {absence.reason}
                            {absence.description && ` - ${absence.description.substring(0, 50)}...`}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusClass(
                            absence.status
                          )}`}
                        >
                          {getStatusLabel(absence.status)}
                        </span>
                        {absence.submitted_on && (
                          <span className="text-xs text-muted-foreground">
                            Soumis le: {new Date(absence.submitted_on).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                        {/* Justifier button removed */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">Aucune absence trouvée</p>
              </div>
            )}
          </div>
        </TabsContent>

      <TabsContent value="current">
        <div className="rounded-md border p-8 text-center">
          <p className="text-muted-foreground">Affichage du semestre actuel</p>
        </div>
      </TabsContent>

      <TabsContent value="previous">
        <div className="rounded-md border p-8 text-center">
          <p className="text-muted-foreground">Affichage des semestres précédents</p>
        </div>
      </TabsContent>
    </Tabs>
    </div >
  );
};

export default AbsenceHistory;
