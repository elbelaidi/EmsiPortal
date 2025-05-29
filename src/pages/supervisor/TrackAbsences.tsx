import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Check, X, Search, FileText, Send, User } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const TrackAbsences = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { absences, classes, students, updateAbsenceStatus } = useData();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedAbsence, setSelectedAbsence] = useState<string | null>(null);
  const [notificationText, setNotificationText] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [detailsAbsence, setDetailsAbsence] = useState<any>(null);
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const absenceId = queryParams.get('id');
  const classId = queryParams.get('class');
  
  useEffect(() => {
    if (absenceId) {
      setSelectedAbsence(absenceId);
    }
    
    if (classId) {
      setClassFilter(classId);
    }
  }, [absenceId, classId]);
  
  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.student_id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : 
           studentId === "1" ? "Ahmed Hassan" : 
           studentId === "2" ? "Mohammed Ali" : 
           studentId === "3" ? "Fatima Zahra" : `Student ${studentId}`;
  };
  
  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId);
    return cls ? cls.name : 'Class A';
  };

  const getStudentClass = (studentId: string) => {
    const student = students.find(s => s.student_id === studentId);
    return student ? `Class ${student.class || 'A'}` : 
           studentId === "1" ? "Class A" : 
           studentId === "2" ? "Class A" : 
           studentId === "3" ? "Class A" : "Unknown Class";
  };
  
  const filteredAbsences = absences.filter(absence => {
    const matchesSearch = 
      absence.subject.toLowerCase().includes(search.toLowerCase()) ||
      absence.date.toLowerCase().includes(search.toLowerCase()) ||
      getStudentName(absence.student_id).toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || absence.status === statusFilter;
    
    const matchesClass = classFilter === 'all' || true; // In a real app, you would check if the student belongs to the selected class
    
    return matchesSearch && matchesStatus && matchesClass;
  });
  
  const handleApprove = async (id: string) => {
    try {
      await updateAbsenceStatus(id, 'justified');
      
      toast({
        title: "Absence justifiée",
        description: "L'absence a été marquée comme justifiée.",
      });
      
      // Show notification dialog
      setSelectedAbsence(id);
      setNotificationText(`L'absence a été justifiée. Souhaitez-vous envoyer une notification à l'étudiant?`);
      setShowDialog(true);
    } catch (error) {
      console.error('Error approving absence:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du statut.",
        variant: "destructive",
      });
    }
  };
  
  const handleReject = async (id: string) => {
    try {
      await updateAbsenceStatus(id, 'unjustified');
      
      toast({
        title: "Absence non justifiée",
        description: "L'absence a été marquée comme non justifiée.",
      });
      
      // Show notification dialog
      setSelectedAbsence(id);
      setNotificationText(`L'absence a été marquée comme non justifiée. Souhaitez-vous envoyer une notification à l'étudiant?`);
      setShowDialog(true);
    } catch (error) {
      console.error('Error rejecting absence:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour du statut.",
        variant: "destructive",
      });
    }
  };
  
  const handleSendNotification = () => {
    toast({
      title: "Notification envoyée",
      description: "L'étudiant a été notifié par SMS.",
    });
    
    setShowDialog(false);
    setSelectedAbsence(null);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'justified':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">Justifiée</Badge>;
      case 'unjustified':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400">Non justifiée</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleViewDetails = (absence: any) => {
    setDetailsAbsence(absence);
    setShowDetailsDialog(true);
  };

  const viewStudentProfile = (studentId: string) => {
    navigate(`/student-details/${studentId}`);
  };

  const handleViewDocument = (documentUrl: string) => {
    if (!documentUrl) return;
    
    // If it's already a blob URL or absolute URL, use it directly
    if (documentUrl.startsWith('blob:') || documentUrl.startsWith('http')) {
      window.open(documentUrl, '_blank');
      return;
    }
    
    // For relative paths, construct the full URL
    const fullUrl = `http://localhost:3001${documentUrl}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Suivi des absences</h1>
        <p className="text-muted-foreground">
          Surveiller et gérer les absences des étudiants
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par nom d'étudiant ou ID..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Toutes les classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les classes</SelectItem>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Réclamations en attente
            <span className="ml-1 rounded-full bg-amber-500 h-5 w-5 text-[10px] flex items-center justify-center text-white">
              {absences.filter(a => a.status === 'pending').length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Réclamations en attente</CardTitle>
              <CardDescription>
                Examiner et approuver ou rejeter les justifications d'absence des étudiants
              </CardDescription>
            </CardHeader>
          <CardContent>
              {filteredAbsences.filter(a => a.status === 'pending').length > 0 ? (
                <div className="space-y-4">
                  {filteredAbsences
                    .filter(a => a.status === 'pending')
                    .map((absence) => (
                      <div
                        key={absence.id}
                        className="p-4 border rounded-md"
                      >
                        <div className="flex justify-between flex-wrap gap-4">
                          <div>
                            <div className="font-medium">{getStudentName(absence.student_id)}</div>
                            <div className="text-sm">ID: {absence.student_id} | {getStudentClass(absence.student_id)}</div>
                          </div>
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">En attente</Badge>
                        </div>
                        
                        <div className="mt-3">
                          <div className="text-sm font-medium">{absence.subject} - {new Date(absence.date).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                          <div className="mt-1 text-sm">
                            <span className="font-medium">Motif:</span> {absence.reason || 'Problème médical'}
                          </div>
                          
                          {absence.document_url && (
                            <div className="mt-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs h-7"
                                onClick={() => handleViewDocument(absence.document_url)}
                              >
                                <FileText className="mr-1 h-3 w-3" />
                                Voir le document justificatif
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 flex justify-end gap-2">
                          <Button
                            onClick={() => handleApprove(absence.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Approuver
                          </Button>
                          <Button
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleReject(absence.id)}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Aucune réclamation en attente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Absences récentes</CardTitle>
              <CardDescription>
                Absences récemment enregistrées dans toutes les classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {absences.slice(0, 5).map((absence) => (
                  <div
                    key={absence.id}
                    className="p-4 border rounded-md flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{getStudentName(absence.student_id)}</div>
                      <div className="text-sm">{absence.subject} - {new Date(absence.date).toLocaleDateString('fr-FR')}</div>
                      <div className="mt-1">{getStatusBadge(absence.status)}</div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(absence)}
                    >
                      Voir les détails
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique des absences</CardTitle>
                <CardDescription>
                  Historique complet de toutes les absences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredAbsences.filter(absence => absence.status !== 'present').length > 0 ? (
                  <div className="space-y-4">
                    {filteredAbsences.filter(absence => absence.status !== 'present').map((absence) => (
                      <div
                        key={absence.id}
                        className="p-4 border rounded-md flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{getStudentName(absence.student_id)}</div>
                          <div className="text-sm">{absence.subject} - {new Date(absence.date).toLocaleDateString('fr-FR')}</div>
                          <div className="mt-1">{getStatusBadge(absence.status)}</div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(absence)}
                        >
                          Voir les détails
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucune absence trouvée</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
      </Tabs>
      
      {/* Notification Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer une notification</DialogTitle>
            <DialogDescription>
              {notificationText}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Écrire un message à l'étudiant..."
                defaultValue="Cher étudiant, votre réclamation d'absence a été traitée. Veuillez vérifier votre portail étudiant pour plus de détails."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSendNotification} className="bg-emsi-green hover:bg-green-700">
              <Send className="mr-2 h-4 w-4" />
              Envoyer la notification SMS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Absence Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails de l'absence</DialogTitle>
            <DialogDescription>
              Informations complètes sur cette absence
            </DialogDescription>
          </DialogHeader>
          
          {detailsAbsence && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  className="rounded-full h-10 w-10 p-0"
                  onClick={() => viewStudentProfile(detailsAbsence.student_id)}
                >
                  <User className="h-4 w-4" />
                </Button>
                <div>
                  <h3 className="font-medium">{getStudentName(detailsAbsence.student_id)}</h3>
                  <p className="text-sm text-muted-foreground">
                    ID: {detailsAbsence.student_id} | {getStudentClass(detailsAbsence.student_id)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Matière</p>
                  <p>{detailsAbsence.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p>{new Date(detailsAbsence.date).toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Heure</p>
                  <p>{detailsAbsence.time || '10:00 - 12:00'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Statut</p>
                  <p>{getStatusBadge(detailsAbsence.status)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Motif</p>
                <p className="mt-1">{detailsAbsence.reason || 'Problème médical'}</p>
              </div>
              
              {detailsAbsence.document_url && (
                <div>
                  <p className="text-sm font-medium">Document justificatif</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="mt-1"
                    onClick={() => handleViewDocument(detailsAbsence.document_url)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Voir le document justificatif
                  </Button>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium">Notes supplémentaires</p>
                <p className="mt-1 text-muted-foreground">
                  {detailsAbsence.description || 'Aucune note supplémentaire fournie.'}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Fermer
            </Button>
            {detailsAbsence && detailsAbsence.status === 'pending' && (
              <>
                <Button 
                  variant="outline"
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => {
                    handleReject(detailsAbsence.id);
                    setShowDetailsDialog(false);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Rejeter
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleApprove(detailsAbsence.id);
                    setShowDetailsDialog(false);
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approuver
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrackAbsences;
