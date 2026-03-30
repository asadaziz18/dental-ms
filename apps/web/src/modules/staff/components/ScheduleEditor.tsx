import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  HStack,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useStaffScheduleQuery, useSetStaffScheduleMutation } from '../hooks/use-staff';
import { DAYS_OF_WEEK } from '../constants';
import type { UpsertStaffScheduleDto } from '@dental-ms/shared-types';

interface ScheduleEditorProps {
  userId: string;
  readOnly?: boolean;
}

export function ScheduleEditor({ userId, readOnly }: ScheduleEditorProps) {
  const toast = useToast();
  const { data: slots = [], isLoading } = useStaffScheduleQuery(userId);
  const setSchedule = useSetStaffScheduleMutation(userId);

  const [byDay, setByDay] = useState<Record<number, { startTime: string; endTime: string }>>({});

  useEffect(() => {
    const next: Record<number, { startTime: string; endTime: string }> = {};
    DAYS_OF_WEEK.forEach((d) => {
      const slot = slots.find((s) => s.dayOfWeek === d.value);
      next[d.value] = {
        startTime: slot?.startTime?.slice(0, 5) ?? '09:00',
        endTime: slot?.endTime?.slice(0, 5) ?? '17:00',
      };
    });
    setByDay(next);
  }, [slots]);

  const handleChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setByDay((prev) => ({
      ...prev,
      [dayOfWeek]: { ...prev[dayOfWeek], [field]: value },
    }));
  };

  const handleSave = async () => {
    const payload: UpsertStaffScheduleDto[] = DAYS_OF_WEEK.map((d) => ({
      dayOfWeek: d.value,
      startTime: byDay[d.value]?.startTime ?? '09:00',
      endTime: byDay[d.value]?.endTime ?? '17:00',
    }));
    try {
      await setSchedule.mutateAsync(payload);
      toast({ title: 'Schedule saved', status: 'success', isClosable: true });
    } catch {
      toast({ title: 'Failed to save schedule', status: 'error', isClosable: true });
    }
  };

  if (isLoading) {
    return <Text>Loading schedule...</Text>;
  }

  return (
    <Box>
      <Heading size="sm" mb={3} color="teal.700" _dark={{ color: 'teal.300' }}>
        Weekly availability
      </Heading>
      <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }} mb={4}>
        Set working hours per day for this branch. Leave as-is for no change.
      </Text>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
        {DAYS_OF_WEEK.map(({ value, label }) => (
          <FormControl key={value}>
            <FormLabel fontSize="xs">{label}</FormLabel>
            {readOnly ? (
              <Text fontSize="sm" color="gray.500">
                {byDay[value]?.startTime ?? '—'} – {byDay[value]?.endTime ?? '—'}
              </Text>
            ) : (
              <HStack gap={2}>
                <Input
                  type="time"
                  size="sm"
                  value={byDay[value]?.startTime ?? ''}
                  onChange={(e) => handleChange(value, 'startTime', e.target.value)}
                />
                <Text fontSize="xs">–</Text>
                <Input
                  type="time"
                  size="sm"
                  value={byDay[value]?.endTime ?? ''}
                  onChange={(e) => handleChange(value, 'endTime', e.target.value)}
                />
              </HStack>
            )}
          </FormControl>
        ))}
      </Grid>
      {!readOnly && (
        <Button
          mt={4}
          colorScheme="teal"
          size="sm"
          onClick={handleSave}
          isLoading={setSchedule.isPending}
        >
          Save schedule
        </Button>
      )}
    </Box>
  );
}
