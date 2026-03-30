import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Switch,
  VStack,
  SimpleGrid,
  Checkbox,
  CheckboxGroup,
  useToast,
  HStack,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useCreateLabVendorMutation } from '../hooks/use-labs';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  contactPerson: z.string().min(1, 'Required'),
  phone: z.string().min(1, 'Required'),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().min(1, 'Required'),
  specializations: z.array(z.string()).min(1, 'Select at least one'),
  notes: z.string().optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const SPEC_OPTIONS = [
  { value: 'crown_bridge', label: 'Crowns & Bridges' },
  { value: 'denture', label: 'Dentures' },
  { value: 'orthodontic', label: 'Orthodontic' },
  { value: 'veneer_laminate', label: 'Veneers & Laminates' },
  { value: 'implant', label: 'Implants' },
  { value: 'custom', label: 'Other' },
];

export function CreateVendorPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const createMutation = useCreateLabVendorMutation();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      specializations: [],
      isActive: true,
    },
  });

  const specializations = watch('specializations') ?? [];

  const onSubmit = async (values: FormValues) => {
    try {
      const created = await createMutation.mutateAsync({
        name: values.name,
        contactPerson: values.contactPerson,
        phone: values.phone,
        whatsapp: values.whatsapp || null,
        email: values.email || null,
        address: values.address || null,
        city: values.city,
        specializations: values.specializations,
        notes: values.notes || null,
        isActive: values.isActive,
      });
      toast({ title: 'Vendor created', status: 'success', duration: 2000 });
      navigate(`/labs/vendors/${created.id}`);
    } catch (e) {
      toast({ title: 'Failed', description: e instanceof Error ? e.message : 'Unknown error', status: 'error' });
    }
  };

  return (
    <Box>
      <Button leftIcon={<ArrowBackIcon />} variant="ghost" size="sm" mb={4} onClick={() => navigate('/labs/vendors')}>
        Back to vendors
      </Button>
      <Heading size="lg" mb={6}>Add Lab Vendor</Heading>

      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack align="stretch" spacing={6} maxW="2xl">
          <FormControl isInvalid={!!errors.name}>
            <FormLabel>Vendor Name *</FormLabel>
            <Input {...register('name')} placeholder="e.g. Crown Masters Lab" />
          </FormControl>
          <FormControl isInvalid={!!errors.contactPerson}>
            <FormLabel>Contact Person *</FormLabel>
            <Input {...register('contactPerson')} />
          </FormControl>
          <FormControl isInvalid={!!errors.phone}>
            <FormLabel>Phone *</FormLabel>
            <Input {...register('phone')} placeholder="+92-321-1234567" />
          </FormControl>
          <FormControl>
            <FormLabel>WhatsApp number</FormLabel>
            <Input {...register('whatsapp')} placeholder="+92 (with country code)" />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" {...register('email')} />
          </FormControl>
          <FormControl>
            <FormLabel>Address</FormLabel>
            <Input {...register('address')} />
          </FormControl>
          <FormControl isInvalid={!!errors.city}>
            <FormLabel>City *</FormLabel>
            <Input {...register('city')} />
          </FormControl>
          <FormControl isInvalid={!!errors.specializations}>
            <FormLabel>Specializations *</FormLabel>
            <CheckboxGroup
              value={specializations}
              onChange={(v) => setValue('specializations', v as string[], { shouldValidate: true })}
            >
              <SimpleGrid columns={2} spacing={2}>
                {SPEC_OPTIONS.map((o) => (
                  <Checkbox key={o.value} value={o.value}>{o.label}</Checkbox>
                ))}
              </SimpleGrid>
            </CheckboxGroup>
          </FormControl>
          <FormControl>
            <FormLabel>Notes</FormLabel>
            <Textarea {...register('notes')} rows={3} />
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <FormLabel mb={0}>Active</FormLabel>
            <Switch {...register('isActive')} defaultChecked />
          </FormControl>
          <HStack>
            <Button type="submit" colorScheme="teal" isLoading={createMutation.isPending}>
              Create Vendor
            </Button>
            <Button variant="outline" onClick={() => navigate('/labs/vendors')}>
              Cancel
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
}
