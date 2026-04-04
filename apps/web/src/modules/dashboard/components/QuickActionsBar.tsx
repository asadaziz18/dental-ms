import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { HStack, Button, Tooltip, useBreakpointValue } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useSyncStatus } from '@/shared/hooks/useSyncStatus';

export interface QuickActionsBarProps {
  onPrintTodaySchedule?: () => void;
  printTodayScheduleDisabled?: boolean;
  /** Shown when the print button is disabled (e.g. no branch, still loading). */
  printTodayScheduleDisabledReason?: string;
}

export function QuickActionsBar({
  onPrintTodaySchedule,
  printTodayScheduleDisabled = false,
  printTodayScheduleDisabledReason,
}: QuickActionsBarProps) {
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
      <Tooltip
        label={
          printTodayScheduleDisabled
            ? (printTodayScheduleDisabledReason ?? 'Not available right now')
            : 'Print a detailed list of today’s appointments (times, patient, phone, doctor, chair, notes)'
        }
      >
        <span>
          <Button
            size="sm"
            variant="outline"
            colorScheme="teal"
            isDisabled={printTodayScheduleDisabled || !onPrintTodaySchedule}
            onClick={() => onPrintTodaySchedule?.()}
          >
            {!isCompact && "Print Today's Schedule"}
          </Button>
        </span>
      </Tooltip>
    </HStack>
  );
}
