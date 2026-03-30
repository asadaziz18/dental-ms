import {
  Box,
  Heading,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Skeleton,
  Text,
  Badge,
} from '@chakra-ui/react';
import { useSubscription, useSubscriptionUsage } from '../hooks/use-subscription';

export function SettingsSubscriptionPage() {
  const { subscription, isLoading: subLoading } = useSubscription();
  const { data: usage, isLoading: usageLoading } = useSubscriptionUsage();

  if (subLoading && !subscription) {
    return <Skeleton height="200px" />;
  }

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Subscription
      </Heading>

      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Current plan</Heading>
        </CardHeader>
        <CardBody>
          {subscription ? (
            <>
              <Badge colorScheme="teal" fontSize="md" mb={2}>
                {subscription.planName}
              </Badge>
              <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                Status: {subscription.status}
              </Text>
              <Text fontSize="sm">
                Period: {new Date(subscription.currentPeriodStart).toLocaleDateString()} –{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </Text>
              {subscription.trialEndsAt && (
                <Text fontSize="sm">
                  Trial ends: {new Date(subscription.trialEndsAt).toLocaleDateString()}
                </Text>
              )}
            </>
          ) : (
            <Text color="gray.500">No active subscription. Contact your administrator.</Text>
          )}
        </CardBody>
      </Card>

      <Heading size="md" mb={3}>
        Usage
      </Heading>
      {usageLoading ? (
        <Skeleton height="120px" />
      ) : usage ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Patients</StatLabel>
                <StatNumber>
                  {usage.usage.patients} / {usage.limits.maxPatients}
                </StatNumber>
                <Progress
                  value={
                    usage.limits.maxPatients
                      ? Math.min(100, (usage.usage.patients / usage.limits.maxPatients) * 100)
                      : 0
                  }
                  colorScheme={usage.canAddPatient ? 'teal' : 'red'}
                  size="sm"
                  mt={2}
                  borderRadius="full"
                />
                <StatHelpText>{usage.canAddPatient ? 'Within limit' : 'Limit reached'}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Staff</StatLabel>
                <StatNumber>
                  {usage.usage.staff} / {usage.limits.maxStaff}
                </StatNumber>
                <Progress
                  value={
                    usage.limits.maxStaff
                      ? Math.min(100, (usage.usage.staff / usage.limits.maxStaff) * 100)
                      : 0
                  }
                  colorScheme={usage.canAddStaff ? 'teal' : 'red'}
                  size="sm"
                  mt={2}
                  borderRadius="full"
                />
                <StatHelpText>{usage.canAddStaff ? 'Within limit' : 'Limit reached'}</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      ) : (
        <Text color="gray.500">Usage data not available.</Text>
      )}

      {usage && (
        <Box mt={6}>
          <Heading size="sm" mb={2}>
            Plan features
          </Heading>
          <SimpleGrid columns={2} gap={2} fontSize="sm">
            <Text>Imaging: {usage.limits.imaging ? 'Yes' : 'No'}</Text>
            <Text>Reports: {usage.limits.reports ? 'Yes' : 'No'}</Text>
            <Text>Inventory: {usage.limits.inventory ? 'Yes' : 'No'}</Text>
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
}
