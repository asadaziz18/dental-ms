import { Alert, AlertIcon, AlertDescription, Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useSubscription } from '@/modules/subscription/hooks/use-subscription';

export function SubscriptionBanner() {
  const { subscription, isTrialing, isGrace, isSuspended, isLoading } = useSubscription();

  if (isLoading || !subscription) return null;
  if (isGrace) {
    return (
      <Alert status="warning" borderRadius="0" py={2}>
        <AlertIcon />
        <AlertDescription flex={1}>
          Your subscription is past due. Please pay the outstanding invoice to avoid suspension.
        </AlertDescription>
        <Button as={RouterLink} to="/settings/subscription" size="sm" colorScheme="orange">
          View subscription
        </Button>
      </Alert>
    );
  }
  if (isSuspended) {
    return (
      <Alert status="error" borderRadius="0" py={2}>
        <AlertIcon />
        <AlertDescription flex={1}>
          This branch is suspended. Please contact support to restore access.
        </AlertDescription>
      </Alert>
    );
  }
  if (isTrialing) {
    const end = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
    return (
      <Alert status="info" borderRadius="0" py={2}>
        <AlertIcon />
        <AlertDescription flex={1}>
          You are on a free trial
          {end ? ` until ${end.toLocaleDateString()}.` : '.'}
        </AlertDescription>
        <Button as={RouterLink} to="/settings/subscription" size="sm" variant="outline">
          View subscription
        </Button>
      </Alert>
    );
  }
  return null;
}
