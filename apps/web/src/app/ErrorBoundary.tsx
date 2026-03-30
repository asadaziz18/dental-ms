import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <Box p={8} maxW="md" mx="auto">
          <VStack align="stretch" gap={4}>
            <Heading size="md" color="red.600">
              Something went wrong
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {this.state.error.message}
            </Text>
            <Button
              size="sm"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try again
            </Button>
          </VStack>
        </Box>
      );
    }
    return this.props.children;
  }
}
