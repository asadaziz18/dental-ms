import { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  HStack,
  Link,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { pdf } from '@react-pdf/renderer';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import userManualMd from '@docs/USER_MANUAL.md?raw';
import { parseManualMd } from './parse-manual-md';
import { UserManualPdfDocument } from './UserManualPdfDocument';

export function UserManualPage() {
  const toast = useToast();
  const [pdfLoading, setPdfLoading] = useState(false);

  const downloadPdf = useCallback(async () => {
    setPdfLoading(true);
    try {
      const blocks = parseManualMd(userManualMd);
      const blob = await pdf(<UserManualPdfDocument blocks={blocks} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Dental-MS-User-Manual.pdf';
      a.rel = 'noopener';
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'PDF downloaded', status: 'success', isClosable: true });
    } catch {
      toast({
        title: 'Could not create PDF',
        description: 'Try again or use Print and choose Save as PDF.',
        status: 'error',
        isClosable: true,
      });
    } finally {
      setPdfLoading(false);
    }
  }, [toast]);

  const printPage = useCallback(() => {
    window.print();
  }, []);

  return (
    <Box maxW="container.md" mx="auto" px={{ base: 2, md: 0 }} className="user-manual-page">
      <HStack mb={6} flexWrap="wrap" gap={3} className="no-print">
        <Button as={RouterLink} to="/settings" leftIcon={<ChevronLeftIcon />} variant="ghost" size="sm">
          Back to settings
        </Button>
        <Button colorScheme="teal" size="sm" onClick={downloadPdf} isLoading={pdfLoading} loadingText="Building PDF">
          Download PDF
        </Button>
        <Button variant="outline" size="sm" onClick={printPage}>
          Print / Save as PDF
        </Button>
      </HStack>

      <VStack align="stretch" spacing={6} className="user-manual-body">
        <Box>
          <Heading size="lg" mb={2}>
            User manual
          </Heading>
          <Text color="gray.600" _dark={{ color: 'gray.400' }} fontSize="sm">
            Use <strong>Download PDF</strong> for a generated file, or <strong>Print / Save as PDF</strong> to use your
            browser&apos;s print dialog (choose &quot;Save as PDF&quot; as the destination).
          </Text>
        </Box>

        <Box className="user-manual-markdown">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <Heading as="h1" size="xl" mb={4} mt={2}>
                  {children}
                </Heading>
              ),
              h2: ({ children }) => (
                <Heading as="h2" size="lg" mt={10} mb={3} pb={2} borderBottomWidth="1px" borderColor="gray.200">
                  {children}
                </Heading>
              ),
              h3: ({ children }) => (
                <Heading as="h3" size="md" mt={6} mb={2}>
                  {children}
                </Heading>
              ),
              p: ({ children }) => (
                <Text mb={3} lineHeight="tall">
                  {children}
                </Text>
              ),
              ul: ({ children }) => <UnorderedList mb={4} spacing={1} pl={1}>{children}</UnorderedList>,
              ol: ({ children }) => <OrderedList mb={4} spacing={1} pl={1}>{children}</OrderedList>,
              li: ({ children }) => <ListItem>{children}</ListItem>,
              a: ({ href, children }) => (
                <Link href={href} color="teal.600" isExternal>
                  {children}
                </Link>
              ),
              hr: () => <Box as="hr" my={6} borderColor="gray.200" />,
              strong: ({ children }) => (
                <Box as="strong" fontWeight="semibold" display="inline">
                  {children}
                </Box>
              ),
            }}
          >
            {userManualMd}
          </ReactMarkdown>
        </Box>
      </VStack>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .user-manual-page,
          .user-manual-page * {
            visibility: visible;
          }
          .user-manual-page {
            position: absolute;
            left: 0;
            top: 0;
            max-width: 100% !important;
            width: 100%;
            padding: 12mm;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  );
}
