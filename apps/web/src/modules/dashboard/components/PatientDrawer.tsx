import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Skeleton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { patientsApi } from '@/modules/patients/api';

interface PatientDrawerProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PatientDrawer({ patientId, isOpen, onClose }: PatientDrawerProps) {
  const navigate = useNavigate();
  const { data: patient, isLoading } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientsApi.get(patientId),
    enabled: isOpen && !!patientId,
  });

  const fullName = patient
    ? [patient.firstName, patient.lastName].filter(Boolean).join(' ')
    : '';

  return (
    <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="sm">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Patient</DrawerHeader>
        <DrawerBody>
          {isLoading ? (
            <Skeleton height="20px" />
          ) : patient ? (
            <VStack align="stretch" spacing={4}>
              <Text fontWeight="600">{fullName}</Text>
              {patient.email && <Text fontSize="sm">{patient.email}</Text>}
              {patient.phone && <Text fontSize="sm">{patient.phone}</Text>}
              <Button
                size="sm"
                colorScheme="teal"
                onClick={() => {
                  onClose();
                  navigate(`/patients/${patientId}`);
                }}
              >
                Open full profile
              </Button>
            </VStack>
          ) : (
            <Text color="gray.500">Patient not found</Text>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
