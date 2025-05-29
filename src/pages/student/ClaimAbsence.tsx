import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Check, X } from 'lucide-react';

const ClaimAbsence = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { absences, addAbsenceClaim, setAbsences, students, courses, updateAbsenceStatus } = useData();
  const { toast } = useToast();
  
  // Get student ID from students table
  const student = students.find(s => s.user_id === user?.user_id);
  const studentId = student?.student_id;
  
  // Extract query parameters
  const queryParams = new URLSearchParams(location.search);
  const defaultSubject = queryParams.get('subject') || '';
  const defaultDate = queryParams.get('date') || '';
  
const [selectedAbsenceId, setSelectedAbsenceId] = useState<string | null>(null);
const [subject, setSubject] = useState('');
const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('new');
  
  // Get student absences
  const studentAbsences = absences.filter(
    (absence) => absence.student_id === studentId
  );
  
  const pendingAbsences = studentAbsences.filter(
    (absence) => absence.status === 'pending'
  );
  
const absentAbsences = studentAbsences.filter(absence => absence.status === 'absent');

const selectedAbsenceLabel = selectedAbsenceId
  ? (() => {
      const selected = absentAbsences.find(a => a.id === selectedAbsenceId);
      return selected ? `${selected.subject} - ${new Date(selected.date).toLocaleDateString('fr-FR')}` : '';
    })()
  : '';

// Get distinct course names for the subject dropdown
const distinctCourseNames = Array.from(new Set(courses.map(course => course.name)));

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!selectedAbsenceId || !reason) {
    toast({
      title: "Champs requis",
      description: "Veuillez sélectionner une absence et remplir le motif.",
      variant: "destructive",
    });
    return;
  }

  if (!studentId) {
    toast({
      title: "Erreur",
      description: "Impossible de trouver votre identifiant étudiant.",
      variant: "destructive",
    });
    return;
  }
  
  setSubmitting(true);
  
  try {
    // Update the status to 'pending' for the selected absence
    await updateAbsenceStatus(selectedAbsenceId, 'pending');

    // Refresh absences data
    const absencesResponse = await fetch(`http://localhost:3001/api/students/${studentId}/absences`);
    if (absencesResponse.ok) {
      const updatedAbsences = await absencesResponse.json();
      setAbsences(updatedAbsences);
    }
    
    toast({
      title: "Réclamation soumise",
      description: "Votre réclamation a été soumise avec succès et est en attente d'approbation.",
    });
    
    // Reset form
    setSelectedAbsenceId(null);
    setSubject('');
    setDate('');
    setReason('');
    setDescription('');
    setFile(null);
    
    // Navigate to pending tab
    setActiveTab('pending');
  } catch (error) {
    console.error('Error submitting absence claim:', error);
    toast({
      title: "Erreur",
      description: "Une erreur s'est produite lors de la soumission de votre réclamation.",
      variant: "destructive",
    });
  } finally {
    setSubmitting(false);
  }
};
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Réclamation d'absence</h1>
        <p className="text-muted-foreground">
          Soumettez une réclamation pour justifier vos absences
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="new">Nouvelle réclamation</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            En attente
            {pendingAbsences.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                {pendingAbsences.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Soumettre une nouvelle réclamation d'absence</CardTitle>
                <CardDescription>
                  Fournissez les détails de votre absence et téléchargez les documents justificatifs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
<div className="space-y-2">
  <Label htmlFor="absenceSelect">Absences à réclamer</Label>
  <Select value={selectedAbsenceId ?? ''} onValueChange={(val) => {
    setSelectedAbsenceId(val);
    const selected = absentAbsences.find(a => a.id === val);
    if (selected) {
      setSubject(selected.subject);
      setDate(selected.date);
    } else {
      setSubject('');
      setDate('');
    }
  }} required key={selectedAbsenceId ?? 'empty'}>
    <SelectTrigger id="absenceSelect">
      <SelectValue>
        {selectedAbsenceLabel || 'Sélectionner une absence'}
      </SelectValue>
    </SelectTrigger>
    <SelectContent>
      {absentAbsences.map((absence) => (
        <SelectItem key={absence.id} value={absence.id}>
          {absence.subject} - {new Date(absence.date).toLocaleDateString('fr-FR')}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reason">Motif d'absence</Label>
                    <Select value={reason} onValueChange={setReason} required>
                      <SelectTrigger id="reason">
                        <SelectValue placeholder="Sélectionner un motif" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Medical">Problème médical</SelectItem>
                        <SelectItem value="Family Emergency">Urgence Familiale</SelectItem>
                        <SelectItem value="Administrative">Administratif</SelectItem>
                        <SelectItem value="Transportation">Transport</SelectItem>
                        <SelectItem value="Other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Veuillez fournir des détails sur votre absence..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="document">Document justificatif</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="document"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Téléchargez un certificat médical, une lettre officielle ou tout autre document justificatif (PDF, JPG, PNG)
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Soumission...' : 'Soumettre la réclamation'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="pending">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Réclamations en attente</CardTitle>
                <CardDescription>
                  Vos réclamations en attente d'approbation par un surveillant
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingAbsences.length > 0 ? (
                  <div className="space-y-4">
                    {pendingAbsences.map((absence) => (
                      <div
                        key={absence.id}
                        className="border rounded-md p-4 flex justify-between items-start"
                      >
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
                          {absence.submitted_on && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Soumis le: {new Date(absence.submitted_on).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400">
                          En attente
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Vous n'avez aucune réclamation en attente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Historique des réclamations</CardTitle>
                <CardDescription>
                  Toutes vos réclamations précédentes et leur statut
                </CardDescription>
              </CardHeader>
              <CardContent>
{studentAbsences.filter(a => a.status !== 'pending').length > 0 ? (
  <div className="space-y-4">
    {studentAbsences
      .filter(a => a.status !== 'pending')
      .map((absence) => {
        let statusLabel = '';
        let statusClass = '';
        let statusIcon = null;

        switch (absence.status) {
          case 'justified':
            statusLabel = 'Justifiée';
            statusClass = 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400';
            statusIcon = <Check className="mr-1 h-3 w-3" />;
            break;
          case 'present':
            statusLabel = 'Présent';
            statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400';
            statusIcon = <Check className="mr-1 h-3 w-3" />;
            break;
          case 'absent':
            statusLabel = 'Absent';
            statusClass = 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400';
            statusIcon = <X className="mr-1 h-3 w-3" />;
            break;
          default:
            statusLabel = 'Non justifiée';
            statusClass = 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400';
            statusIcon = <X className="mr-1 h-3 w-3" />;
        }

        return (
          <div
            key={absence.id}
            className="border rounded-md p-4 flex justify-between items-start"
          >
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
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}
              >
                {statusIcon}
                {statusLabel}
              </span>
              {absence.submitted_on && (
                <span className="text-xs text-muted-foreground">
                  Soumis le: {new Date(absence.submitted_on).toLocaleDateString('fr-FR')}
                </span>
              )}
            </div>
          </div>
        );
      })}
  </div>
) : (
  <div className="text-center py-8">
    <p className="text-muted-foreground">
      Vous n'avez aucune réclamation traitée.
    </p>
  </div>
)}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClaimAbsence;
