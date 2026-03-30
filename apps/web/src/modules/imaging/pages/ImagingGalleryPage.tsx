import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

/**
 * Landing at /imaging: prompt to select a patient.
 * Patient-specific gallery is at /patients/:patientId/imaging
 */
export function ImagingGalleryPage() {
  const navigate = useNavigate();
  return (
    <Box>
      <Heading size="lg" color="teal.700" _dark={{ color: 'teal.300' }} mb={4}>
        X-Ray &amp; Imaging
      </Heading>
      <Text color="gray.600" _dark={{ color: 'gray.400' }} mb={4}>
        Open a patient record to view and upload images, or select a patient from the list.
      </Text>
      <Button colorScheme="teal" onClick={() => navigate('/patients')}>
        Go to patients
      </Button>
    </Box>
  );
}
