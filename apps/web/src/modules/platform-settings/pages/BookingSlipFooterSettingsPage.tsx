import { useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import {
  useBookingSlipPlatformSettingsQuery,
  useUpdateBookingSlipFooterMutation,
} from '../hooks/use-platform-settings';

export function BookingSlipFooterSettingsPage() {
  const toast = useToast();
  const { data, isLoading } = useBookingSlipPlatformSettingsQuery();
  const updateMutation = useUpdateBookingSlipFooterMutation();
  const { register, handleSubmit, reset } = useForm<{ productOwnerFooter: string }>({
    defaultValues: { productOwnerFooter: '' },
  });

  useEffect(() => {
    if (data) {
      reset({ productOwnerFooter: data.productOwnerFooter ?? '' });
    }
  }, [data, reset]);

  const onSubmit = async (values: { productOwnerFooter: string }) => {
    try {
      const trimmed = values.productOwnerFooter.trim();
      await updateMutation.mutateAsync(trimmed === '' ? null : trimmed);
      toast({
        title: 'Saved',
        description: 'Booking slip footer is updated for all branches.',
        status: 'success',
        duration: 3000,
      });
    } catch (e: unknown) {
      const message =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : e instanceof Error
            ? e.message
            : 'Failed to save';
      toast({ title: 'Error', description: String(message), status: 'error' });
    }
  };

  return (
    <Box maxW="720px">
      <Heading size="lg" mb={2}>
        Booking slip footer
      </Heading>
      <Box color="gray.600" fontSize="sm" mb={6}>
        Shown on appointment slips, invoice/receipt PDFs, reports PDFs (A4 and 80mm), and each page
        of the user manual PDF. Only Super Admins can change it; all branches use the same line.
      </Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack align="stretch" spacing={4}>
          <FormControl>
            <FormLabel>Product owner / footer line</FormLabel>
            <Textarea
              {...register('productOwnerFooter')}
              rows={4}
              placeholder="e.g. Powered by YourCompany · support@example.com"
              isDisabled={isLoading}
            />
            <FormHelperText>Leave empty to omit the footer line (timestamp still appears).</FormHelperText>
          </FormControl>
          <Button
            type="submit"
            colorScheme="teal"
            alignSelf="flex-start"
            isLoading={updateMutation.isPending}
            isDisabled={isLoading}
          >
            Save
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
