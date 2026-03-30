import { Link as RouterLink } from 'react-router-dom';
import { Box, Heading, List, ListItem, Link } from '@chakra-ui/react';
import { useAuth } from '@/core/auth';

export function SettingsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin';

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Settings
      </Heading>
      <List spacing={3}>
        {isSuperAdmin && (
          <ListItem>
            <Link as={RouterLink} to="/settings/role-permissions" color="teal.600" _dark={{ color: 'teal.400' }}>
              Role permissions
            </Link>
            <Box as="span" fontSize="sm" color="gray.500" ml={2}>
              Allow or disallow screens per role (defaults for all branches)
            </Box>
          </ListItem>
        )}
        <ListItem>
          <Link as={RouterLink} to="/settings/branches" color="teal.600" _dark={{ color: 'teal.400' }}>
            Branch Management
          </Link>
          <Box as="span" fontSize="sm" color="gray.500" ml={2}>
            Manage branches and sub-branches
          </Box>
        </ListItem>
        <ListItem>
          <Link as={RouterLink} to="/settings/subscription" color="teal.600" _dark={{ color: 'teal.400' }}>
            Subscription &amp; usage
          </Link>
          <Box as="span" fontSize="sm" color="gray.500" ml={2}>
            View plan, usage meters, and billing
          </Box>
        </ListItem>
      </List>
    </Box>
  );
}
