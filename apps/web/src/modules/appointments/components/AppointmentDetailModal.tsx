import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Select,
  VStack,
  Text,
  useToast,
  HStack,
} from '@chakra-ui/react';
import type { Appointment } from '@dental-ms/shared-types';
import { APPOINTMENT_STATUSES } from '@dental-ms/shared-types';
import { useUpdateAppointmentStatusMutation } from '../hooks/use-appointments';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export function AppointmentDetailModal({
  isOpen,
  onClose,
  appointment,
}: AppointmentDetailModalProps) {
  const toast = useToast();
  const updateStatus = useUpdateAppointmentStatusMutation(appointment?.id ?? '');

  const handleStatusChange = async (newStatus: string) => {
    if (!appointment) return;
    try {
      await updateStatus.mutateAsync(newStatus);
      toast({ title: 'Status updated', status: 'success', duration: 2000 });
      onClose();
    } catch (e) {
      toast({
        title: 'Update failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  if (!appointment) return null;

  const patientName = appointment.patient
    ? `${appointment.patient.firstName} ${appointment.patient.lastName}`
    : '—';
  const doctorName = appointment.doctor?.fullName ?? '—';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Appointment</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={3}>
            <Text><strong>Patient:</strong> {patientName}</Text>
            <Text><strong>Doctor:</strong> {doctorName}</Text>
            <Text><strong>Time:</strong> {new Date(appointment.start).toLocaleString()} – {new Date(appointment.end).toLocaleString()}</Text>
            <Text><strong>Type:</strong> {appointment.type}</Text>
            {appointment.chair && <Text><strong>Chair:</strong> {appointment.chair}</Text>}
            {appointment.notes && <Text><strong>Notes:</strong> {appointment.notes}</Text>}
            <HStack align="center" mt={2}>
              <Text fontWeight="medium">Status:</Text>
              <Select
                value={appointment.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                w="180px"
                size="sm"
              >
                {APPOINTMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
