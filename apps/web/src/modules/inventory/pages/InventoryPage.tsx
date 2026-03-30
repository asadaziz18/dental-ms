import { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
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
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useAuth } from '@/core/auth';
import {
  useInventorySocket,
} from '../hooks/use-inventory-socket';
import {
  useSuppliersQuery,
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useInventoryItemsQuery,
  useCreateInventoryItemMutation,
  useDeleteInventoryItemMutation,
  useStockLevelsQuery,
  useRecordStockTransactionMutation,
  usePurchaseOrdersQuery,
  useCreatePurchaseOrderMutation,
  useReceivePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
} from '../hooks/use-inventory';

export function InventoryPage() {
  const toast = useToast();
  const { user } = useAuth();
  const branchId = user?.branchId ?? user?.allowedBranches?.[0] ?? null;
  const { lowStockItems } = useInventorySocket(branchId);

  const [newSupplier, setNewSupplier] = useState({ name: '', contactName: '', phone: '', email: '' });
  const [newItem, setNewItem] = useState({ name: '', sku: '', category: '', unit: 'unit', reorderThreshold: 0 });
  const [adjustQty, setAdjustQty] = useState<{ itemId: string; type: 'in' | 'out'; qty: number; referenceType?: 'usage' | 'adjustment'; referenceId?: string } | null>(null);
  const [poForm, setPoForm] = useState<{ supplierId: string; lines: Array<{ itemId: string; qty: number }> }>({ supplierId: '', lines: [{ itemId: '', qty: 1 }] });
  const [receivePoId, setReceivePoId] = useState<string | null>(null);
  const [receiveLines, setReceiveLines] = useState<Array<{ itemId: string; quantityReceived: number }>>([]);

  const { isOpen: supplierOpen, onOpen: onSupplierOpen, onClose: onSupplierClose } = useDisclosure();
  const { isOpen: itemOpen, onOpen: onItemOpen, onClose: onItemClose } = useDisclosure();
  const { isOpen: adjustOpen, onOpen: onAdjustOpen, onClose: onAdjustClose } = useDisclosure();
  const { isOpen: poOpen, onOpen: onPoOpen, onClose: onPoClose } = useDisclosure();
  const { isOpen: receiveOpen, onOpen: onReceiveOpen, onClose: onReceiveClose } = useDisclosure();

  const { data: suppliers } = useSuppliersQuery();
  const { data: items } = useInventoryItemsQuery();
  const { data: stockLevels } = useStockLevelsQuery();
  const { data: purchaseOrders } = usePurchaseOrdersQuery();

  const createSupplier = useCreateSupplierMutation();
  const deleteSupplier = useDeleteSupplierMutation();
  const createItem = useCreateInventoryItemMutation();
  const deleteItem = useDeleteInventoryItemMutation();
  const recordTx = useRecordStockTransactionMutation();
  const createPO = useCreatePurchaseOrderMutation();
  const receivePO = useReceivePurchaseOrderMutation();
  const deletePO = useDeletePurchaseOrderMutation();

  const levelsWithItem = (stockLevels ?? []).map((sl) => {
    const item = (items ?? []).find((i) => i.id === sl.itemId);
    return { ...sl, item };
  }).filter((s) => s.item);

  const handleCreateSupplier = async () => {
    if (!newSupplier.name.trim()) return;
    try {
      await createSupplier.mutateAsync({
        name: newSupplier.name.trim(),
        contactName: newSupplier.contactName.trim() || null,
        phone: newSupplier.phone.trim() || null,
        email: newSupplier.email.trim() || null,
      });
      setNewSupplier({ name: '', contactName: '', phone: '', email: '' });
      onSupplierClose();
      toast({ title: 'Supplier created', status: 'success', duration: 2000 });
    } catch (e) {
      toast({ title: 'Failed', description: (e as Error).message, status: 'error' });
    }
  };

  const handleCreateItem = async () => {
    if (!newItem.name.trim() || !newItem.sku.trim()) return;
    try {
      await createItem.mutateAsync({
        name: newItem.name.trim(),
        sku: newItem.sku.trim(),
        category: newItem.category.trim() || null,
        unit: newItem.unit || 'unit',
        reorderThreshold: newItem.reorderThreshold,
      });
      setNewItem({ name: '', sku: '', category: '', unit: 'unit', reorderThreshold: 0 });
      onItemClose();
      toast({ title: 'Item created', status: 'success', duration: 2000 });
    } catch (e) {
      toast({ title: 'Failed', description: (e as Error).message, status: 'error' });
    }
  };

  const handleRecordAdjustment = async () => {
    if (!adjustQty || adjustQty.qty < 1) return;
    try {
      await recordTx.mutateAsync({
        itemId: adjustQty.itemId,
        type: adjustQty.type,
        quantity: adjustQty.qty,
        referenceType: adjustQty.referenceType ?? 'adjustment',
        referenceId: adjustQty.referenceId || null,
      });
      setAdjustQty(null);
      onAdjustClose();
      toast({ title: 'Stock updated', status: 'success', duration: 2000 });
    } catch (e) {
      toast({ title: 'Failed', description: (e as Error).message, status: 'error' });
    }
  };

  const handleCreatePO = async () => {
    if (!poForm.supplierId || poForm.lines.every((l) => !l.itemId)) return;
    const lines = poForm.lines.filter((l) => l.itemId && l.qty >= 1).map((l) => ({ itemId: l.itemId!, quantityOrdered: l.qty }));
    if (lines.length === 0) return;
    try {
      await createPO.mutateAsync({
        supplierId: poForm.supplierId,
        lines,
      });
      setPoForm({ supplierId: '', lines: [{ itemId: '', qty: 1 }] });
      onPoClose();
      toast({ title: 'Purchase order created', status: 'success', duration: 2000 });
    } catch (e) {
      toast({ title: 'Failed', description: (e as Error).message, status: 'error' });
    }
  };

  const handleReceivePO = async () => {
    if (!receivePoId || receiveLines.every((l) => l.quantityReceived <= 0)) return;
    try {
      await receivePO.mutateAsync({ id: receivePoId!, body: { lines: receiveLines } });
    } catch (e) {
      toast({ title: 'Failed', description: (e as Error).message, status: 'error' });
      return;
    }
    setReceivePoId(null);
    setReceiveLines([]);
    onReceiveClose();
    toast({ title: 'Stock received', status: 'success', duration: 2000 });
  };

  const openReceive = (po: { id: string; lines?: Array<{ itemId: string; quantityOrdered: number; quantityReceived: number }> }) => {
    setReceivePoId(po.id);
    setReceiveLines(
      (po.lines ?? []).map((l) => ({
        itemId: l.itemId,
        quantityReceived: Math.max(0, l.quantityOrdered - l.quantityReceived),
      })),
    );
    onReceiveOpen();
  };

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Inventory &amp; Supplies
      </Heading>

      {lowStockItems.length > 0 && (
        <Alert status="warning" mb={4} borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Low stock</AlertTitle>
            <AlertDescription>
              <Wrap>
                {lowStockItems.map((i) => (
                  <WrapItem key={i.itemId}>
                    <Badge colorScheme="orange" mr={2}>
                      {i.itemName} ({i.sku}): {i.quantity} &le; {i.reorderThreshold}
                    </Badge>
                  </WrapItem>
                ))}
              </Wrap>
            </AlertDescription>
          </Box>
        </Alert>
      )}

      <Tabs variant="enclosed" colorScheme="teal">
        <TabList>
          <Tab>Catalog</Tab>
          <Tab>Stock levels</Tab>
          <Tab>Purchase orders</Tab>
          <Tab>Suppliers</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Button leftIcon={<AddIcon />} size="sm" colorScheme="teal" mb={3} onClick={onItemOpen}>
              Add item
            </Button>
            <Modal isOpen={itemOpen} onClose={onItemClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>New inventory item</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl isRequired mb={2}>
                    <FormLabel size="sm">Name</FormLabel>
                    <Input size="sm" value={newItem.name} onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))} />
                  </FormControl>
                  <FormControl isRequired mb={2}>
                    <FormLabel size="sm">SKU</FormLabel>
                    <Input size="sm" value={newItem.sku} onChange={(e) => setNewItem((p) => ({ ...p, sku: e.target.value }))} />
                  </FormControl>
                  <FormControl mb={2}>
                    <FormLabel size="sm">Category</FormLabel>
                    <Input size="sm" value={newItem.category} onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))} />
                  </FormControl>
                  <HStack>
                    <FormControl>
                      <FormLabel size="sm">Unit</FormLabel>
                      <Input size="sm" value={newItem.unit} onChange={(e) => setNewItem((p) => ({ ...p, unit: e.target.value }))} />
                    </FormControl>
                    <FormControl>
                      <FormLabel size="sm">Reorder threshold</FormLabel>
                      <NumberInput size="sm" min={0} value={newItem.reorderThreshold} onChange={(_, n) => setNewItem((p) => ({ ...p, reorderThreshold: n }))}>
                        <NumberInputField />
                      </NumberInput>
                    </FormControl>
                  </HStack>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onItemClose}>Cancel</Button>
                  <Button colorScheme="teal" onClick={handleCreateItem} isLoading={createItem.isPending}>Create</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>SKU</Th>
                    <Th>Category</Th>
                    <Th>Unit</Th>
                    <Th>Reorder</Th>
                    <Th w="60px" />
                  </Tr>
                </Thead>
                <Tbody>
                  {(items ?? []).map((item) => (
                    <Tr key={item.id}>
                      <Td>{item.name}</Td>
                      <Td>{item.sku}</Td>
                      <Td>{item.category ?? '—'}</Td>
                      <Td>{item.unit}</Td>
                      <Td>{item.reorderThreshold}</Td>
                      <Td>
                        <IconButton aria-label="Delete" size="xs" variant="ghost" icon={<DeleteIcon />} onClick={async () => { if (confirm('Delete?')) await deleteItem.mutateAsync(item.id); }} />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          <TabPanel>
            <Button
              size="sm"
              colorScheme="teal"
              mb={3}
              onClick={() => {
                setAdjustQty({ itemId: (items ?? [])[0]?.id ?? '', type: 'in', qty: 1, referenceType: 'adjustment' });
                onAdjustOpen();
              }}
            >
              Adjust stock
            </Button>
            <Modal isOpen={adjustOpen} onClose={onAdjustClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Adjust stock</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {adjustQty && (
                    <>
                      <FormControl mb={2}>
                        <FormLabel size="sm">Item</FormLabel>
                        <Select
                          size="sm"
                          value={adjustQty.itemId}
                          onChange={(e) => setAdjustQty((p) => p ? { ...p, itemId: e.target.value } : null)}
                        >
                          {(items ?? []).map((i) => (
                            <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl mb={2}>
                        <FormLabel size="sm">Type</FormLabel>
                        <Select size="sm" value={adjustQty.type} onChange={(e) => setAdjustQty((p) => p ? { ...p, type: e.target.value as 'in' | 'out' } : null)}>
                          <option value="in">In</option>
                          <option value="out">Out</option>
                        </Select>
                      </FormControl>
                      <FormControl mb={2}>
                        <FormLabel size="sm">Quantity</FormLabel>
                        <NumberInput size="sm" min={1} value={adjustQty.qty} onChange={(_, n) => setAdjustQty((p) => p ? { ...p, qty: n } : null)}>
                          <NumberInputField />
                        </NumberInput>
                      </FormControl>
                      {adjustQty.type === 'out' && (
                        <>
                          <FormControl mb={2}>
                            <FormLabel size="sm">Reference type</FormLabel>
                            <Select size="sm" value={adjustQty.referenceType ?? 'adjustment'} onChange={(e) => setAdjustQty((p) => p ? { ...p, referenceType: e.target.value as 'usage' | 'adjustment' } : null)}>
                              <option value="adjustment">Adjustment</option>
                              <option value="usage">Usage (treatment)</option>
                            </Select>
                          </FormControl>
                          <FormControl mb={2}>
                            <FormLabel size="sm">Reference ID (e.g. treatment plan item)</FormLabel>
                            <Input size="sm" value={adjustQty.referenceId ?? ''} onChange={(e) => setAdjustQty((p) => p ? { ...p, referenceId: e.target.value.trim() || undefined } : null)} placeholder="Optional" />
                          </FormControl>
                        </>
                      )}
                    </>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onAdjustClose}>Cancel</Button>
                  <Button colorScheme="teal" onClick={handleRecordAdjustment} isLoading={recordTx.isPending}>Apply</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Item</Th>
                    <Th>SKU</Th>
                    <Th>Quantity</Th>
                    <Th>Reorder</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {levelsWithItem.map((sl) => {
                    const low = sl.item!.reorderThreshold > 0 && sl.quantity <= sl.item!.reorderThreshold;
                    return (
                      <Tr key={sl.id}>
                        <Td>{sl.item!.name}</Td>
                        <Td>{sl.item!.sku}</Td>
                        <Td>{sl.quantity}</Td>
                        <Td>{sl.item!.reorderThreshold}</Td>
                        <Td>{low ? <Badge colorScheme="orange">Low</Badge> : <Badge colorScheme="green">OK</Badge>}</Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          <TabPanel>
            <Button leftIcon={<AddIcon />} size="sm" colorScheme="teal" mb={3} onClick={onPoOpen}>
              New purchase order
            </Button>
            <Modal isOpen={poOpen} onClose={onPoClose} size="lg">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>New purchase order</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl isRequired mb={3}>
                    <FormLabel size="sm">Supplier</FormLabel>
                    <Select size="sm" value={poForm.supplierId} onChange={(e) => setPoForm((p) => ({ ...p, supplierId: e.target.value }))}>
                      <option value="">Select supplier</option>
                      {(suppliers ?? []).map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormLabel size="sm">Lines</FormLabel>
                  {poForm.lines.map((line, idx) => (
                    <HStack key={idx} mb={2}>
                      <Select
                        size="sm"
                        flex={1}
                        value={line.itemId}
                        onChange={(e) =>
                          setPoForm((p) => ({
                            ...p,
                            lines: p.lines.map((l, i) => (i === idx ? { ...l, itemId: e.target.value } : l)),
                          }))
                        }
                      >
                        <option value="">Select item</option>
                        {(items ?? []).map((i) => (
                          <option key={i.id} value={i.id}>{i.name} ({i.sku})</option>
                        ))}
                      </Select>
                      <NumberInput size="sm" w="24" min={1} value={line.qty} onChange={(_, n) => setPoForm((p) => ({ ...p, lines: p.lines.map((l, i) => (i === idx ? { ...l, qty: n } : l)) }))}>
                        <NumberInputField />
                      </NumberInput>
                    </HStack>
                  ))}
                  <Button size="xs" variant="outline" onClick={() => setPoForm((p) => ({ ...p, lines: [...p.lines, { itemId: '', qty: 1 }] }))}>
                    Add line
                  </Button>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onPoClose}>Cancel</Button>
                  <Button colorScheme="teal" onClick={handleCreatePO} isLoading={createPO.isPending}>Create</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <Modal isOpen={receiveOpen} onClose={onReceiveClose} size="lg">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Receive stock</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {receiveLines.map((line, idx) => {
                    const po = (purchaseOrders ?? []).find((p) => p.id === receivePoId);
                    const pol = po?.lines?.find((l) => l.itemId === line.itemId);
                    const item = (items ?? []).find((i) => i.id === line.itemId);
                    return (
                      <HStack key={line.itemId} mb={2}>
                        <Text flex={1} fontSize="sm">{item?.name ?? line.itemId}</Text>
                        <NumberInput
                          size="sm"
                          w="28"
                          min={0}
                          max={pol ? pol.quantityOrdered - pol.quantityReceived : undefined}
                          value={line.quantityReceived}
                          onChange={(_, n) => setReceiveLines((prev) => prev.map((l, i) => (i === idx ? { ...l, quantityReceived: n } : l)))}
                        >
                          <NumberInputField />
                        </NumberInput>
                        {pol && <Text fontSize="xs" color="gray.500">max {pol.quantityOrdered - pol.quantityReceived}</Text>}
                      </HStack>
                    );
                  })}
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onReceiveClose}>Cancel</Button>
                  <Button colorScheme="teal" onClick={handleReceivePO} isLoading={receivePO.isPending}>Receive</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Order #</Th>
                    <Th>Supplier</Th>
                    <Th>Status</Th>
                    <Th>Expected</Th>
                    <Th />
                  </Tr>
                </Thead>
                <Tbody>
                  {(purchaseOrders ?? []).map((po) => (
                    <Tr key={po.id}>
                      <Td>{po.orderNumber ?? po.id.slice(0, 8)}</Td>
                      <Td>{po.supplier?.name ?? po.supplierId}</Td>
                      <Td><Badge>{po.status}</Badge></Td>
                      <Td>{po.expectedDate ?? '—'}</Td>
                      <Td>
                        {(po.status === 'Draft' || po.status === 'PartiallyReceived') && (
                          <Button size="xs" colorScheme="teal" onClick={() => openReceive(po)}>
                            Receive
                          </Button>
                        )}
                        {po.status === 'Draft' && (
                          <Button size="xs" variant="ghost" colorScheme="red" ml={2} onClick={async () => { if (confirm('Delete?')) await deletePO.mutateAsync(po.id); }}>
                            Delete
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          <TabPanel>
            <Button leftIcon={<AddIcon />} size="sm" colorScheme="teal" mb={3} onClick={onSupplierOpen}>
              Add supplier
            </Button>
            <Modal isOpen={supplierOpen} onClose={onSupplierClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>New supplier</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <FormControl isRequired mb={2}>
                    <FormLabel size="sm">Name</FormLabel>
                    <Input size="sm" value={newSupplier.name} onChange={(e) => setNewSupplier((p) => ({ ...p, name: e.target.value }))} />
                  </FormControl>
                  <FormControl mb={2}>
                    <FormLabel size="sm">Contact</FormLabel>
                    <Input size="sm" value={newSupplier.contactName} onChange={(e) => setNewSupplier((p) => ({ ...p, contactName: e.target.value }))} />
                  </FormControl>
                  <FormControl mb={2}>
                    <FormLabel size="sm">Phone</FormLabel>
                    <Input size="sm" value={newSupplier.phone} onChange={(e) => setNewSupplier((p) => ({ ...p, phone: e.target.value }))} />
                  </FormControl>
                  <FormControl>
                    <FormLabel size="sm">Email</FormLabel>
                    <Input size="sm" type="email" value={newSupplier.email} onChange={(e) => setNewSupplier((p) => ({ ...p, email: e.target.value }))} />
                  </FormControl>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost" mr={3} onClick={onSupplierClose}>Cancel</Button>
                  <Button colorScheme="teal" onClick={handleCreateSupplier} isLoading={createSupplier.isPending}>Create</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Contact</Th>
                    <Th>Phone</Th>
                    <Th>Email</Th>
                    <Th w="60px" />
                  </Tr>
                </Thead>
                <Tbody>
                  {(suppliers ?? []).map((s) => (
                    <Tr key={s.id}>
                      <Td>{s.name}</Td>
                      <Td>{s.contactName ?? '—'}</Td>
                      <Td>{s.phone ?? '—'}</Td>
                      <Td>{s.email ?? '—'}</Td>
                      <Td>
                        <IconButton aria-label="Delete" size="xs" variant="ghost" icon={<DeleteIcon />} onClick={async () => { if (confirm('Delete?')) await deleteSupplier.mutateAsync(s.id); }} />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
