import { useState, useEffect } from 'react';
import { Box, Image, Skeleton, Text, Badge } from '@chakra-ui/react';
import type { ImagingRecord } from '@dental-ms/shared-types';
import { getThumbnailFromCache, setThumbnailCache } from '../hooks/use-imaging';
import { generateThumbnailDataUrl } from '../utils/thumbnail';

interface ImageCardProps {
  imaging: ImagingRecord;
  imageUrl: string | undefined;
  onClick: () => void;
}

export function ImageCard({ imaging, imageUrl, onClick }: ImageCardProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await getThumbnailFromCache(imaging.id);
      if (cached) {
        if (!cancelled) setThumbUrl(cached);
        setLoading(false);
        return;
      }
      if (!imageUrl) {
        setLoading(false);
        return;
      }
      try {
        const dataUrl = await generateThumbnailDataUrl(imageUrl);
        if (!cancelled) {
          setThumbUrl(dataUrl);
          await setThumbnailCache(imaging.id, dataUrl);
        }
      } catch {
        if (!cancelled) setThumbUrl(imageUrl);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [imaging.id, imageUrl]);

  return (
    <Box
      as="button"
      type="button"
      textAlign="left"
      borderRadius="lg"
      overflow="hidden"
      bg="gray.100"
      _dark={{ bg: 'gray.700' }}
      onClick={onClick}
      _hover={{ shadow: 'md' }}
      transition="shadow 0.2s"
    >
      <Box position="relative" w="full" aspectRatio={4 / 3} bg="gray.200" _dark={{ bg: 'gray.600' }}>
        {loading ? (
          <Skeleton w="full" h="full" />
        ) : thumbUrl ? (
          <Image
            src={thumbUrl}
            alt={imaging.fileName}
            w="full"
            h="full"
            objectFit="cover"
          />
        ) : (
          <Box w="full" h="full" display="flex" alignItems="center" justify="center">
            <Text color="gray.500">No preview</Text>
          </Box>
        )}
        {imaging.toothNumber != null && (
          <Badge
            position="absolute"
            bottom={2}
            right={2}
            colorScheme="teal"
          >
            Tooth {imaging.toothNumber}
          </Badge>
        )}
      </Box>
      <Box px={2} py={1}>
        <Text fontSize="xs" noOfLines={1} color="gray.600" _dark={{ color: 'gray.400' }}>
          {imaging.fileName}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {new Date(imaging.createdAt).toLocaleDateString()}
        </Text>
      </Box>
    </Box>
  );
}
