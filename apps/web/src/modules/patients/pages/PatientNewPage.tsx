import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useCreatePatientMutation } from '../hooks/use-patients';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional().nullable(),
  medicalHistory: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  insuranceProvider: z.string().optional().nullable(),
  insuranceId: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export function PatientNewPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const createMutation = useCreatePatientMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const patient = await createMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth || null,
        gender: data.gender || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        medicalHistory: data.medicalHistory || null,
        allergies: data.allergies || null,
        insuranceProvider: data.insuranceProvider || null,
        insuranceId: data.insuranceId || null,
      });
      toast({ title: 'Patient created', status: 'success', duration: 2000 });
      navigate(`/patients/${patient.id}`);
    } catch (e) {
      toast({
        title: 'Create failed',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  return (
    <Box>
      <Button
        leftIcon={<ArrowBackIcon />}
        variant="ghost"
        size="sm"
        mb={6}
        onClick={() => navigate('/patients')}
      >
        Back to list
      </Button>

      <Heading size="lg" mb={6} color="teal.700">
        New patient
      </Heading>

      <Box as="form" onSubmit={handleSubmit(onSubmit)} bg="white" p={6} borderRadius="lg" shadow="sm" maxW="2xl">
        <VStack align="stretch" spacing={4}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isInvalid={!!errors.firstName}>
              <FormLabel>First name</FormLabel>
              <Input {...register('firstName')} placeholder="First name" />
              <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.lastName}>
              <FormLabel>Last name</FormLabel>
              <Input {...register('lastName')} placeholder="Last name" />
              <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Date of birth</FormLabel>
              <Input type="date" {...register('dateOfBirth')} />
            </FormControl>
            <FormControl>
              <FormLabel>Gender</FormLabel>
              <Input {...register('gender')} placeholder="e.g. Male, Female" />
            </FormControl>
          </SimpleGrid>

          <FormControl isInvalid={!!errors.phone}>
            <FormLabel>Phone</FormLabel>
            <Input {...register('phone')} placeholder="Phone" />
            <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input type="email" {...register('email')} placeholder="Email" />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>Address</FormLabel>
            <Textarea {...register('address')} rows={2} placeholder="Address" />
          </FormControl>

          <FormControl>
            <FormLabel>Medical history</FormLabel>
            <Textarea {...register('medicalHistory')} rows={3} placeholder="Medical history notes" />
          </FormControl>

          <FormControl>
            <FormLabel>Allergies</FormLabel>
            <Textarea {...register('allergies')} rows={2} placeholder="Known allergies" />
          </FormControl>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel>Insurance provider</FormLabel>
              <Input {...register('insuranceProvider')} placeholder="Provider name" />
            </FormControl>
            <FormControl>
              <FormLabel>Insurance ID</FormLabel>
              <Input {...register('insuranceId')} placeholder="Member ID" />
            </FormControl>
          </SimpleGrid>

          <Button
            type="submit"
            colorScheme="teal"
            isLoading={createMutation.isPending}
            mt={2}
          >
            Create patient
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
