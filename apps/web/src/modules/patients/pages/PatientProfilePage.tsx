import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Text,
  Skeleton,
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  HStack,
  Badge,
  Avatar,
  IconButton,
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import {
  usePatientQuery,
  useUpdatePatientMutation,
  usePatientTimelineQuery,
} from '../hooks/use-patients';
import { PatientLabOrdersTab } from '@/modules/labs';
import type { Patient, PatientUpdateInput } from '@dental-ms/shared-types';

function Field({
  label,
  value,
  edit,
  name,
  type = 'text',
  onChange,
}: {
  label: string;
  value: string | null | undefined;
  edit?: boolean;
  name?: string;
  type?: string;
  onChange?: (v: string) => void;
}) {
  const v = value ?? '—';
  if (edit && name && onChange) {
    return (
      <FormControl>
        <FormLabel size="sm" color="gray.600">
          {label}
        </FormLabel>
        {type === 'textarea' ? (
          <Textarea
            size="sm"
            name={name}
            defaultValue={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
          />
        ) : (
          <Input
            size="sm"
            name={name}
            type={type}
            defaultValue={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </FormControl>
    );
  }
  return (
    <Box>
      <Text fontSize="xs" color="gray.500" mb={0}>
        {label}
      </Text>
      <Text fontSize="sm" whiteSpace="pre-wrap">
        {v}
      </Text>
    </Box>
  );
}

export function PatientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<PatientUpdateInput>({});

  const { data: patient, isLoading, isError } = usePatientQuery(id);
  const { data: timeline } = usePatientTimelineQuery(id);
  const updateMutation = useUpdatePatientMutation(id ?? '');

  const handleSave = async () => {
    if (!id || Object.keys(form).length === 0) {
      setEditing(false);
      return;
    }
    try {
      await updateMutation.mutateAsync(form);
      setForm({});
      setEditing(false);
      toast({ title: 'Saved', status: 'success', duration: 2000 });
    } catch (e) {
      toast({
        title: 'Update failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  if (!id) {
    return (
      <Box>
        <Text color="red.500">Missing patient ID</Text>
        <Button mt={2} onClick={() => navigate('/patients')}>
          Back to list
        </Button>
      </Box>
    );
  }

  if (isLoading || !patient) {
    return (
      <Box>
        <Skeleton height="32px" w="200px" mb={4} />
        <Skeleton height="120px" mb={4} />
        <Skeleton height="80px" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box>
        <Text color="red.500">Patient not found</Text>
        <Button mt={2} onClick={() => navigate('/patients')}>
          Back to list
        </Button>
      </Box>
    );
  }

  const fullName = [patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'Patient';

  return (
    <Box>
      <HStack mb={6} gap={4}>
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          size="sm"
          onClick={() => navigate('/patients')}
        >
          Back
        </Button>
        <Avatar
          size="md"
          name={fullName}
          src={patient.avatarUrl ?? undefined}
          bg="teal.500"
        />
        <Box flex={1}>
          <Heading size="lg">{fullName}</Heading>
          <Badge colorScheme="teal" mt={1}>
            {patient.branchId}
          </Badge>
        </Box>
        {!editing ? (
          <Button
            leftIcon={<EditIcon />}
            size="sm"
            colorScheme="teal"
            variant="outline"
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
        ) : (
          <HStack>
            <Button
              leftIcon={<CheckIcon />}
              size="sm"
              colorScheme="teal"
              onClick={handleSave}
              isLoading={updateMutation.isPending}
            >
              Save
            </Button>
            <IconButton
              aria-label="Cancel"
              size="sm"
              variant="ghost"
              icon={<CloseIcon />}
              onClick={() => {
                setEditing(false);
                setForm({});
              }}
            />
          </HStack>
        )}
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <Heading size="sm" mb={4} color="gray.700">
            Demographics
          </Heading>
          <VStack align="stretch" spacing={3}>
            <Field
              label="First name"
              value={patient.firstName}
              edit={editing}
              name="firstName"
              onChange={(v) => setForm((f) => ({ ...f, firstName: v }))}
            />
            <Field
              label="Last name"
              value={patient.lastName}
              edit={editing}
              name="lastName"
              onChange={(v) => setForm((f) => ({ ...f, lastName: v }))}
            />
            <Field
              label="Date of birth"
              value={patient.dateOfBirth ?? undefined}
              edit={editing}
              name="dateOfBirth"
              type="date"
              onChange={(v) => setForm((f) => ({ ...f, dateOfBirth: v || null }))}
            />
            <Field
              label="Gender"
              value={patient.gender ?? undefined}
              edit={editing}
              name="gender"
              onChange={(v) => setForm((f) => ({ ...f, gender: v || null }))}
            />
          </VStack>
        </Box>

        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <Heading size="sm" mb={4} color="gray.700">
            Contact
          </Heading>
          <VStack align="stretch" spacing={3}>
            <Field
              label="Phone"
              value={patient.phone ?? undefined}
              edit={editing}
              name="phone"
              onChange={(v) => setForm((f) => ({ ...f, phone: v || null }))}
            />
            <Field
              label="Email"
              value={patient.email ?? undefined}
              edit={editing}
              name="email"
              type="email"
              onChange={(v) => setForm((f) => ({ ...f, email: v || null }))}
            />
            <Field
              label="Address"
              value={patient.address ?? undefined}
              edit={editing}
              name="address"
              type="textarea"
              onChange={(v) => setForm((f) => ({ ...f, address: v || null }))}
            />
          </VStack>
        </Box>

        <Box bg="white" p={6} borderRadius="lg" shadow="sm" gridColumn={{ md: '1 / -1' }}>
          <Heading size="sm" mb={4} color="gray.700">
            Medical history
          </Heading>
          <Field
            label="Notes"
            value={patient.medicalHistory ?? undefined}
            edit={editing}
            name="medicalHistory"
            type="textarea"
            onChange={(v) => setForm((f) => ({ ...f, medicalHistory: v || null }))}
          />
        </Box>

        <Box bg="white" p={6} borderRadius="lg" shadow="sm" gridColumn={{ md: '1 / -1' }}>
          <Heading size="sm" mb={4} color="gray.700">
            Allergies
          </Heading>
          <Field
            label="Allergies"
            value={patient.allergies ?? undefined}
            edit={editing}
            name="allergies"
            type="textarea"
            onChange={(v) => setForm((f) => ({ ...f, allergies: v || null }))}
          />
        </Box>

        <Box bg="white" p={6} borderRadius="lg" shadow="sm" gridColumn={{ md: '1 / -1' }}>
          <Heading size="sm" mb={4} color="gray.700">
            Insurance
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Field
              label="Provider"
              value={patient.insuranceProvider ?? undefined}
              edit={editing}
              name="insuranceProvider"
              onChange={(v) => setForm((f) => ({ ...f, insuranceProvider: v || null }))}
            />
            <Field
              label="Insurance ID"
              value={patient.insuranceId ?? undefined}
              edit={editing}
              name="insuranceId"
              onChange={(v) => setForm((f) => ({ ...f, insuranceId: v || null }))}
            />
          </SimpleGrid>
        </Box>

        <Box bg="white" p={6} borderRadius="lg" shadow="sm" gridColumn={{ md: '1 / -1' }}>
          <Heading size="sm" mb={4} color="gray.700">
            Treatment plans
          </Heading>
          <Button
            size="sm"
            colorScheme="teal"
            variant="outline"
            onClick={() => navigate(`/patients/${id}/treatments`)}
          >
            View treatment plans
          </Button>
        </Box>

        <Box bg="white" p={6} borderRadius="lg" shadow="sm" gridColumn={{ md: '1 / -1' }}>
          <Heading size="sm" mb={4} color="gray.700">
            Billing
          </Heading>
          <Button
            size="sm"
            colorScheme="teal"
            variant="outline"
            onClick={() => navigate(`/patients/${id}/billing`)}
          >
            View billing &amp; invoices
          </Button>
        </Box>

        <Box bg="white" p={6} borderRadius="lg" shadow="sm" gridColumn={{ md: '1 / -1' }}>
          <Heading size="sm" mb={4} color="gray.700">
            Imaging
          </Heading>
          <Button
            size="sm"
            colorScheme="teal"
            variant="outline"
            onClick={() => navigate(`/patients/${id}/imaging`)}
          >
            View images &amp; X-rays
          </Button>
        </Box>

        <Box bg="white" p={6} borderRadius="lg" shadow="sm" gridColumn={{ md: '1 / -1' }}>
          <PatientLabOrdersTab patientId={id!} />
        </Box>

        <Box bg="white" p={6} borderRadius="lg" shadow="sm" gridColumn={{ md: '1 / -1' }}>
          <Heading size="sm" mb={4} color="gray.700">
            Timeline
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Visits and payments will appear here once those modules are added.
          </Text>
          {(timeline?.events?.length ?? 0) > 0 ? (
            <VStack align="stretch" mt={2} spacing={2}>
              {timeline!.events.map((ev) => (
                <Box key={ev.id} py={2} borderBottomWidth="1px">
                  <Text fontWeight="medium">{ev.title}</Text>
                  <Text fontSize="xs" color="gray.500">
                    {ev.date} · {ev.type}
                  </Text>
                </Box>
              ))}
            </VStack>
          ) : null}
        </Box>
      </SimpleGrid>
    </Box>
  );
}
