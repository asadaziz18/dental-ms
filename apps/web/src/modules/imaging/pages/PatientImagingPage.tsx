import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Heading,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalHeader,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
  Input,
  useToast,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import { AddIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import { usePatientQuery } from '@/modules/patients/hooks/use-patients';
import {
  useImagingByPatientQuery,
  usePresignedUrlQuery,
  useUploadImagingMutation,
  useUpdateImagingMutation,
  useDeleteImagingMutation,
} from '../hooks/use-imaging';
import { ImageCard } from '../components/ImageCard';
import { ImageViewer } from '../components/ImageViewer';
import type { ImagingRecord, ImagingAnnotation } from '@dental-ms/shared-types';
import { ALL_FDI } from '@/modules/treatments/constants';

export function PatientImagingPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadTooth, setUploadTooth] = useState<number | ''>('');
  const { isOpen: isViewerOpen, onOpen: onViewerOpen, onClose: onViewerClose } = useDisclosure();
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();

  const { data: patient, isLoading: patientLoading } = usePatientQuery(patientId);
  const { data: images = [], isLoading: imagesLoading } = useImagingByPatientQuery(patientId);
  const uploadMutation = useUploadImagingMutation(patientId ?? '');
  const updateMutation = useUpdateImagingMutation(selectedId ?? '');
  const deleteMutation = useDeleteImagingMutation(patientId ?? '');

  const selectedImage = selectedId ? images.find((i) => i.id === selectedId) : null;
  const { data: selectedUrl } = usePresignedUrlQuery(selectedId);

  const handleCardClick = (id: string) => {
    setSelectedId(id);
    onViewerOpen();
  };

  const handleSaveAnnotations = async (annotations: ImagingAnnotation[]) => {
    if (!selectedId) return;
    try {
      await updateMutation.mutateAsync({ annotations });
      toast({ title: 'Annotations saved', status: 'success', isClosable: true });
    } catch {
      toast({ title: 'Failed to save annotations', status: 'error', isClosable: true });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !patientId) return;
    try {
      await uploadMutation.mutateAsync({
        file,
        toothNumber: uploadTooth === '' ? null : uploadTooth,
      });
      toast({ title: 'Image uploaded', status: 'success', isClosable: true });
      onUploadClose();
      e.target.value = '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast({ title: msg, status: 'error', isClosable: true });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      if (selectedId === id) onViewerClose();
      toast({ title: 'Image deleted', status: 'success', isClosable: true });
    } catch {
      toast({ title: 'Failed to delete', status: 'error', isClosable: true });
    }
  };

  if (patientLoading || !patient) {
    return (
      <Box>
        <Skeleton h="8" w="48" mb={4} />
        <Skeleton h="200px" />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={6} display="flex" alignItems="center" gap={4}>
        <Button
          leftIcon={<ChevronLeftIcon />}
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/patients/${patientId}`)}
        >
          Back
        </Button>
        <Heading size="lg" color="teal.700" _dark={{ color: 'teal.300' }}>
          Imaging — {patient.firstName} {patient.lastName}
        </Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="teal"
          size="sm"
          onClick={onUploadOpen}
        >
          Upload image
        </Button>
      </Box>

      <Input
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        display="none"
        id="imaging-upload"
        onChange={handleUpload}
      />

      <Modal isOpen={isUploadOpen} onClose={onUploadClose} size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload image</ModalHeader>
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Tooth number (optional)</FormLabel>
              <Select
                placeholder="None"
                value={uploadTooth === '' ? '' : String(uploadTooth)}
                onChange={(e) => setUploadTooth(e.target.value === '' ? '' : Number(e.target.value))}
              >
                {ALL_FDI.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </Select>
            </FormControl>
            <Button
              w="full"
              colorScheme="teal"
              onClick={() => document.getElementById('imaging-upload')?.click()}
              isLoading={uploadMutation.isPending}
            >
              Choose file (JPEG/PNG)
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {imagesLoading ? (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} aspectRatio={4 / 3} borderRadius="lg" />
          ))}
        </SimpleGrid>
      ) : images.length === 0 ? (
        <Text color="gray.500" py={8}>
          No images yet. Upload an image to get started.
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 2, md: 4, lg: 5 }} spacing={4}>
          {images.map((img) => (
            <ImageCardWithUrl
              key={img.id}
              imaging={img}
              onClick={() => handleCardClick(img.id)}
            />
          ))}
        </SimpleGrid>
      )}

      <Modal isOpen={isViewerOpen} onClose={onViewerClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>
            {selectedImage?.fileName}
            {selectedImage && (
              <Button
                size="sm"
                colorScheme="red"
                variant="ghost"
                ml={4}
                onClick={() => selectedImage && handleDelete(selectedImage.id)}
              >
                Delete
              </Button>
            )}
          </ModalHeader>
          <ModalBody overflow="auto" pb={4}>
            {selectedImage && selectedUrl && (
              <ImageViewer
                imageUrl={selectedUrl}
                imaging={selectedImage}
                annotations={selectedImage.annotations}
                onSaveAnnotations={handleSaveAnnotations}
                onClose={onViewerClose}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

function ImageCardWithUrl({ imaging, onClick }: { imaging: ImagingRecord; onClick: () => void }) {
  const { data: url } = usePresignedUrlQuery(imaging.id);
  return <ImageCard imaging={imaging} imageUrl={url} onClick={onClick} />;
}
