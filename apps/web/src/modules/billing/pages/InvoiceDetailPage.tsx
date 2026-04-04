import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  Text,
  Skeleton,
  VStack,
  HStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Select,
  useToast,
  SimpleGrid,
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  useInvoiceQuery,
  useUpdateInvoiceMutation,
  useAddInvoiceLineItemMutation,
  useRemoveInvoiceLineItemMutation,
  usePaymentsByInvoiceQuery,
  useCreatePaymentMutation,
} from '../hooks/use-billing';
import { useProceduresQuery as useProceduresQueryTreatments } from '@/modules/treatments/hooks/use-treatments';
import { AddLineItemModal, type AddLineItemFormValues } from '../components/AddLineItemModal';
import { RecordPaymentModal, type RecordPaymentFormValues } from '../components/RecordPaymentModal';
import { useBranchDetail } from '@/modules/branches/hooks/use-branches';
import { useBookingSlipPlatformSettingsQuery } from '@/modules/platform-settings';
import { downloadReceiptPdf } from '../utils/download-receipt';

const STATUS_OPTIONS = ['Draft', 'Sent', 'PartiallyPaid', 'Paid', 'Overdue', 'Cancelled'] as const;

export function InvoiceDetailPage() {
  const { patientId, invoiceId } = useParams<{ patientId: string; invoiceId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [addLineOpen, setAddLineOpen] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { data: invoice, isLoading, isError } = useInvoiceQuery(invoiceId);
  const { data: procedures } = useProceduresQueryTreatments();
  const { data: payments } = usePaymentsByInvoiceQuery(invoiceId);
  const { data: branchDetail } = useBranchDetail(
    invoice?.branchId ?? null,
    !!invoice?.branchId,
  );
  const { data: slipSettings } = useBookingSlipPlatformSettingsQuery(!!invoice);
  const updateMutation = useUpdateInvoiceMutation(invoiceId ?? '', patientId ?? '');
  const addLineMutation = useAddInvoiceLineItemMutation(invoiceId ?? '', patientId ?? '');
  const removeLineMutation = useRemoveInvoiceLineItemMutation(invoiceId ?? '', patientId ?? '');
  const createPaymentMutation = useCreatePaymentMutation(invoiceId ?? '', patientId ?? '');

  const patientName = invoice?.patient
    ? [invoice.patient.firstName, invoice.patient.lastName].filter(Boolean).join(' ')
    : 'Patient';

  const clinic = useMemo(() => {
    if (!branchDetail) {
      return { name: 'Clinic' as const };
    }
    return {
      name: branchDetail.name,
      address: branchDetail.address || null,
      city: branchDetail.city || null,
      phone: branchDetail.phone || null,
      email: branchDetail.email || null,
      code: branchDetail.code || null,
      openingTime: branchDetail.openingTime || null,
      closingTime: branchDetail.closingTime || null,
    };
  }, [branchDetail]);

  const totalNum = invoice ? parseFloat(invoice.total) : 0;
  const paidNum = (payments ?? []).reduce((s, p) => s + parseFloat(p.amount), 0);
  const outstandingNum = Math.max(0, totalNum - paidNum);

  const handleAddLineItem = async (values: AddLineItemFormValues) => {
    try {
      await addLineMutation.mutateAsync({
        procedureId: values.procedureId || null,
        description: values.description,
        quantity: values.quantity,
        unitPrice: values.unitPrice,
        discountAmount: values.discountAmount,
      });
      toast({ title: 'Line item added', status: 'success', duration: 2000 });
    } catch (e) {
      toast({
        title: 'Failed to add line item',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  const handleRemoveLineItem = async (itemId: string) => {
    try {
      await removeLineMutation.mutateAsync(itemId);
      toast({ title: 'Line item removed', status: 'success', duration: 2000 });
    } catch (e) {
      toast({
        title: 'Failed to remove',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  const handleRecordPayment = async (values: RecordPaymentFormValues) => {
    try {
      await createPaymentMutation.mutateAsync({
        invoiceId: invoiceId!,
        amount: values.amount,
        method: values.method,
        reference: values.reference || null,
      });
      toast({ title: 'Payment recorded', status: 'success', duration: 2000 });
    } catch (e) {
      toast({
        title: 'Failed to record payment',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  const handleStatusChange = async (status: typeof STATUS_OPTIONS[number]) => {
    try {
      await updateMutation.mutateAsync({ status });
      toast({ title: 'Status updated', status: 'success', duration: 2000 });
    } catch {
      toast({ title: 'Failed to update status', status: 'error' });
    }
  };

  const handleDownloadPDF = async (variant: 'standard' | 'thermal') => {
    if (!invoice) return;
    setPdfLoading(true);
    try {
      const paymentRows = payments ?? invoice.payments ?? [];
      await downloadReceiptPdf({
        variant,
        clinic,
        productOwnerFooter: slipSettings?.productOwnerFooter,
        patientName,
        invoiceNumber: invoice.invoiceNumber,
        invoiceId: invoice.id,
        invoiceDate: new Date(invoice.createdAt).toLocaleDateString(),
        dueDate: invoice.dueDate
          ? new Date(invoice.dueDate).toLocaleDateString()
          : null,
        lineItems: (invoice.lineItems ?? []).map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          discountAmount: l.discountAmount,
          lineTotal: l.lineTotal,
        })),
        subtotal: invoice.subtotal,
        discountAmount: invoice.discountAmount,
        taxRatePercent: invoice.taxRatePercent,
        taxAmount: invoice.taxAmount,
        total: invoice.total,
        payments: paymentRows.map((p) => ({
          amount: p.amount,
          method: p.method,
          paidAt: new Date(p.paidAt).toLocaleString(),
        })),
      });
      toast({
        title: 'PDF saved',
        description:
          variant === 'thermal'
            ? 'Thermal (80mm) receipt saved to your downloads.'
            : 'Standard (A4) receipt saved to your downloads.',
        status: 'success',
        duration: 2500,
      });
    } catch (e) {
      toast({
        title: 'Failed to generate PDF',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    } finally {
      setPdfLoading(false);
    }
  };

  if (!patientId || !invoiceId) {
    return (
      <Box>
        <Text color="red.500">Missing patient or invoice ID</Text>
        <Button mt={2} onClick={() => navigate('/patients')}>
          Back to patients
        </Button>
      </Box>
    );
  }

  if (isLoading || !invoice) {
    return (
      <Box>
        <Skeleton height="32px" w="200px" mb={4} />
        <Skeleton height="200px" mb={4} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box>
        <Text color="red.500">Invoice not found</Text>
        <Button mt={2} onClick={() => navigate(`/patients/${patientId}/billing`)}>
          Back to billing
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <HStack mb={6} gap={4} flexWrap="wrap">
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/patients/${patientId}/billing`)}
        >
          Back
        </Button>
        <Box flex={1}>
          <Heading size="lg">Invoice</Heading>
          <Text fontSize="sm" color="gray.600">
            {patientName}
            {invoice.invoiceNumber && ` · #${invoice.invoiceNumber}`}
          </Text>
        </Box>
        <Select
          size="sm"
          w="140px"
          value={invoice.status}
          onChange={(e) =>
            handleStatusChange(e.target.value as typeof STATUS_OPTIONS[number])
          }
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Badge colorScheme="teal">{invoice.status}</Badge>
        <HStack spacing={2}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void handleDownloadPDF('standard');
            }}
            isLoading={pdfLoading}
          >
            Receipt (A4)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void handleDownloadPDF('thermal');
            }}
            isLoading={pdfLoading}
          >
            Receipt (80mm)
          </Button>
        </HStack>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box>
          <HStack justify="space-between" mb={2}>
            <Heading size="sm">Line items</Heading>
            <Button
              leftIcon={<AddIcon />}
              size="sm"
              colorScheme="teal"
              onClick={() => setAddLineOpen(true)}
            >
              Add item
            </Button>
          </HStack>
          <AddLineItemModal
            isOpen={addLineOpen}
            onClose={() => setAddLineOpen(false)}
            procedures={procedures ?? []}
            onSubmit={handleAddLineItem}
            isSubmitting={addLineMutation.isPending}
          />
          <Box overflowX="auto">
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Description</Th>
                  <Th>Qty</Th>
                  <Th>Unit</Th>
                  <Th>Discount</Th>
                  <Th>Total</Th>
                  <Th w="40px" />
                </Tr>
              </Thead>
              <Tbody>
                {(invoice.lineItems ?? []).map((line) => (
                  <Tr key={line.id}>
                    <Td>{line.description}</Td>
                    <Td>{line.quantity}</Td>
                    <Td>{line.unitPrice}</Td>
                    <Td>{line.discountAmount}</Td>
                    <Td>{line.lineTotal}</Td>
                    <Td>
                      <IconButton
                        aria-label="Remove"
                        size="xs"
                        variant="ghost"
                        icon={<DeleteIcon />}
                        onClick={() => handleRemoveLineItem(line.id)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          {(!invoice.lineItems || invoice.lineItems.length === 0) && (
            <Text fontSize="sm" color="gray.500" py={4}>
              No line items. Add procedures or custom items.
            </Text>
          )}

          <Box mt={4} p={3} bg="gray.50" borderRadius="md">
            <HStack justify="space-between" mb={1}>
              <Text fontSize="sm">Subtotal</Text>
              <Text fontSize="sm">{invoice.subtotal}</Text>
            </HStack>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="sm">Discount</Text>
              <Text fontSize="sm">-{invoice.discountAmount}</Text>
            </HStack>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="sm">Tax ({invoice.taxRatePercent}%)</Text>
              <Text fontSize="sm">{invoice.taxAmount}</Text>
            </HStack>
            <HStack justify="space-between" fontWeight="bold">
              <Text>Total</Text>
              <Text>{invoice.total}</Text>
            </HStack>
          </Box>
        </Box>

        <Box>
          <Heading size="sm" mb={2}>
            Payments
          </Heading>
          <Button
            size="sm"
            colorScheme="teal"
            mb={3}
            onClick={() => setRecordPaymentOpen(true)}
          >
            Record payment
          </Button>
          <RecordPaymentModal
            isOpen={recordPaymentOpen}
            onClose={() => setRecordPaymentOpen(false)}
            invoiceTotal={totalNum}
            alreadyPaid={paidNum}
            onSubmit={handleRecordPayment}
            isSubmitting={createPaymentMutation.isPending}
          />
          <VStack align="stretch" spacing={2}>
            {(payments ?? []).map((p) => (
              <Box key={p.id} p={3} borderWidth="1px" borderRadius="md">
                <HStack justify="space-between">
                  <Text fontWeight="medium">{p.method}</Text>
                  <Text>{p.amount}</Text>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {new Date(p.paidAt).toLocaleString()}
                  {p.reference ? ` · ${p.reference}` : ''}
                </Text>
              </Box>
            ))}
          </VStack>
          <Box mt={4} p={3} bg="teal.50" borderRadius="md">
            <Text fontSize="sm" color="gray.600">
              Outstanding
            </Text>
            <Text fontSize="xl" fontWeight="bold">
              {outstandingNum.toFixed(2)}
            </Text>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
