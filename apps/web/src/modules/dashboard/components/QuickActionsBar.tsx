import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { HStack, Button, Tooltip, useBreakpointValue } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useSyncStatus } from '@/shared/hooks/useSyncStatus';

export function QuickActionsBar() {
  const { isOnline } = useSyncStatus();
  const navigate = useNavigate();
  const isCompact = useBreakpointValue({ base: true, md: false });

  return (
    <HStack spacing={2} flexWrap="wrap">
      <Button as={RouterLink} to="/appointments" size="sm" variant="outline" colorScheme="teal" leftIcon={<AddIcon />}>
        {!isCompact && 'New Appointment'}
      </Button>
      <Button as={RouterLink} to="/patients/new" size="sm" variant="outline" colorScheme="teal" leftIcon={<AddIcon />}>
        {!isCompact && 'New Patient'}
      </Button>
      <Tooltip label={!isOnline ? 'Available when online' : 'Record payment for a patient'}>
        <span>
          <Button
            size="sm"
            variant="outline"
            colorScheme="teal"
            isDisabled={!isOnline}
            onClick={() => isOnline && navigate('/patients')}
          >
            {!isCompact && 'Record Payment'}
          </Button>
        </span>
      </Tooltip>
      <Button size="sm" variant="outline" colorScheme="teal" onClick={() => window.print()}>
        {!isCompact && "Print Today's Schedule"}
      </Button>
    </HStack>
  );
}
