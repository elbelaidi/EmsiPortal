import { useData } from '../../context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type DeleteStudentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  student: any;
};

const DeleteStudentDialog = ({ isOpen, onClose, student }: DeleteStudentDialogProps) => {
  const { deleteStudent } = useData();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteStudent(student.student_id);
      toast({
        title: "Student deleted",
        description: "The student has been deleted successfully",
      });
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete student",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Student</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {student.first_name} {student.last_name}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteStudentDialog;
