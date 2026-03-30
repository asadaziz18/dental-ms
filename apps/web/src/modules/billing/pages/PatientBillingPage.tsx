import { useState } from 'react';
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
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon } from '@chakra-ui/icons';
import { usePatientQuery } from '@/modules/patients/hooks/use-patients';
import { useTreatmentPlansByPatientQuery } from '@/modules/treatments/hooks/use-treatments';
import {
  useOutstandingBalanceQuery,
  useInvoicesByPatientQuery,
  useCreateInvoiceMutation,
  useDeleteInvoiceMutation,
  useInsuranceClaimsByPatientQuery,
  useCreateInsuranceClaimMutation,
} from '../hooks/use-billing';

const CLAIM_STATUSES = ['Draft', 'Submitted', 'Approved', 'Denied', 'Paid', 'Partial'] as const;

export function PatientBillingPage() {
  const { id: patientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen: invoiceOpen, onOpen: onInvoiceOpen, onClose: onInvoiceClose } = useDisclosure();
  const { isOpen: claimOpen, onOpen: onClaimOpen, onClose: onClaimClose } = useDisclosure();
  const [treatmentPlanId, setTreatmentPlanId] = useState<string>('');
  const [claimStatus, setClaimStatus] = useState<string>('Draft');
  const [claimInvoiceId, setClaimInvoiceId] = useState<string>('');

  const { data: patient, isLoading: patientLoading } = usePatientQuery(patientId);
  const { data: plans } = useTreatmentPlansByPatientQuery(patientId);
  const { data: balance, isLoading: balanceLoading } = useOutstandingBalanceQuery(patientId);
  const { data: invoices, isLoading: invoicesLoading } = useInvoicesByPatientQuery(patientId);
  const { data: claims, isLoading: claimsLoading } = useInsuranceClaimsByPatientQuery(patientId);
  const createInvoiceMutation = useCreateInvoiceMutation(patientId ?? '');
  const deleteInvoiceMutation = useDeleteInvoiceMutation(patientId ?? '');
  const createClaimMutation = useCreateInsuranceClaimMutation(patientId ?? '');

  const patientName = patient
    ? [patient.firstName, patient.lastName].filter(Boolean).join(' ') || 'Patient'
    : 'Patient';

  const handleCreateInvoice = async () => {
    if (!patientId) return;
    try {
      const invoice = await createInvoiceMutation.mutateAsync({
        treatmentPlanId: treatmentPlanId || null,
      });
      onInvoiceClose();
      toast({ title: 'Invoice created', status: 'success', duration: 2000 });
      navigate(`/patients/${patientId}/billing/invoices/${invoice.id}`);
    } catch (e) {
      toast({
        title: 'Failed to create invoice',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  const handleCreateClaim = async () => {
    if (!patientId) return;
    try {
      await createClaimMutation.mutateAsync({
        invoiceId: claimInvoiceId || null,
        status: claimStatus,
        insuranceProvider: patient?.insuranceProvider ?? undefined,
      });
      onClaimClose();
      toast({ title: 'Claim created', status: 'success', duration: 2000 });
    } catch (e) {
      toast({
        title: 'Failed to create claim',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  const handleDeleteInvoice = async (invId: string) => {
    if (!confirm('Delete this invoice?')) return;
    try {
      await deleteInvoiceMutation.mutateAsync(invId);
      toast({ title: 'Invoice deleted', status: 'success', duration: 2000 });
    } catch (e) {
      toast({
        title: 'Failed to delete',
        description: e instanceof Error ? e.message : 'Unknown error',
        status: 'error',
      });
    }
  };

  if (!patientId) {
    return (
      <Box>
        <Text color="red.500">Missing patient ID</Text>
        <Button mt={2} onClick={() => navigate('/patients')}>
          Back to patients
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <HStack mb={6} gap={4}>
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/patients/${patientId}`)}
        >
          Back
        </Button>
        <Box flex={1}>
          <Heading size="lg">Billing</Heading>
          <Text fontSize="sm" color="gray.600">
            {patientName}
          </Text>
        </Box>
        <Button leftIcon={<AddIcon />} size="sm" colorScheme="teal" onClick={onInvoiceOpen}>
          New invoice
        </Button>
      </HStack>

      <Modal isOpen={invoiceOpen} onClose={onInvoiceClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New invoice</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel size="sm">Link to treatment plan (optional)</FormLabel>
              <Select
                size="sm"
                value={treatmentPlanId}
                onChange={(e) => setTreatmentPlanId(e.target.value)}
              >
                <option value="">— None —</option>
                {(plans ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    Plan · {p.status} · {(p.items?.length ?? 0)} items
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onInvoiceClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleCreateInvoice}
              isLoading={createInvoiceMutation.isPending}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={claimOpen} onClose={onClaimClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New insurance claim</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel size="sm">Invoice (optional)</FormLabel>
              <Select
                size="sm"
                value={claimInvoiceId}
                onChange={(e) => setClaimInvoiceId(e.target.value)}
              >
                <option value="">— None —</option>
                {(invoices ?? []).map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber ?? inv.id.slice(0, 8)} · {inv.total}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel size="sm">Status</FormLabel>
              <Select
                size="sm"
                value={claimStatus}
                onChange={(e) => setClaimStatus(e.target.value)}
              >
                {CLAIM_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClaimClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleCreateClaim}
              isLoading={createClaimMutation.isPending}
            >
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {balanceLoading ? (
        <Skeleton height="80px" mb={6} />
      ) : (
        <Box
          p={6}
          borderRadius="lg"
          bg="teal.50"
          borderWidth="1px"
          borderColor="teal.100"
          mb={6}
        >
          <Heading size="sm" mb={2} color="gray.700">
            Outstanding balance
          </Heading>
          <HStack spacing={8}>
            <Box>
              <Text fontSize="xs" color="gray.600">
                Total
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {(balance?.total ?? 0).toFixed(2)}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.600">
                Paid
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {(balance?.paid ?? 0).toFixed(2)}
              </Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.600">
                Outstanding
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                {(balance?.outstanding ?? 0).toFixed(2)}
              </Text>
            </Box>
          </HStack>
        </Box>
      )}

      <Tabs variant="enclosed" colorScheme="teal">
        <TabList>
          <Tab>Invoices</Tab>
          <Tab>Insurance claims</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {invoicesLoading ? (
              <Skeleton height="120px" />
            ) : (
              <VStack align="stretch" spacing={3}>
                {(invoices?.length ?? 0) === 0 ? (
                  <Text color="gray.500">No invoices yet. Create one to get started.</Text>
                ) : (
                  invoices!.map((inv) => {
                    const paid = (inv.payments ?? []).reduce(
                      (s, p) => s + parseFloat(p.amount),
                      0,
                    );
                    const out = Math.max(0, parseFloat(inv.total) - paid);
                    return (
                      <Box
                        key={inv.id}
                        p={4}
                        borderWidth="1px"
                        borderRadius="lg"
                        _hover={{ shadow: 'md' }}
                      >
                        <HStack justify="space-between">
                          <HStack>
                            <Badge colorScheme="teal">{inv.status}</Badge>
                            <Text fontSize="sm">
                              {inv.invoiceNumber ?? inv.id.slice(0, 8)} · Total: {inv.total}
                              {out > 0 && (
                                <Text as="span" color="orange.600" ml={2}>
                                  Outstanding: {out.toFixed(2)}
                                </Text>
                              )}
                            </Text>
                          </HStack>
                          <HStack>
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="teal"
                              onClick={() =>
                                navigate(
                                  `/patients/${patientId}/billing/invoices/${inv.id}`,
                                )
                              }
                            >
                              Open
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeleteInvoice(inv.id)}
                              isLoading={deleteInvoiceMutation.isPending}
                            >
                              Delete
                            </Button>
                          </HStack>
                        </HStack>
                      </Box>
                    );
                  })
                )}
              </VStack>
            )}
          </TabPanel>
          <TabPanel>
            <Button size="sm" colorScheme="teal" mb={3} onClick={onClaimOpen}>
              New claim
            </Button>
            {claimsLoading ? (
              <Skeleton height="100px" />
            ) : (
              <Box overflowX="auto">
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Claim #</Th>
                      <Th>Status</Th>
                      <Th>Provider</Th>
                      <Th>Claimed</Th>
                      <Th>Approved</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(claims ?? []).map((c) => (
                      <Tr key={c.id}>
                        <Td>{c.claimNumber ?? '—'}</Td>
                        <Td>
                          <Badge size="sm">{c.status}</Badge>
                        </Td>
                        <Td>{c.insuranceProvider ?? '—'}</Td>
                        <Td>{c.amountClaimed ?? '—'}</Td>
                        <Td>{c.amountApproved ?? '—'}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
            {(!claims || claims.length === 0) && !claimsLoading && (
              <Text color="gray.500">No insurance claims.</Text>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
