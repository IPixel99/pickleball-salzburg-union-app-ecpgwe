
// Global error logging for runtime errors

import { Platform } from "react-native";

// Simple debouncing to prevent duplicate errors
const recentErrors: { [key: string]: boolean } = {};
const clearErrorAfterDelay = (errorKey: string) => {
  setTimeout(() => delete recentErrors[errorKey], 100);
};

// Function to send errors to parent window (React frontend)
const sendErrorToParent = (level: string, message: string, data: any) => {
  // Create a simple key to identify duplicate errors
  const errorKey = `${level}:${message}:${JSON.stringify(data)}`;

  // Skip if we've seen this exact error recently
  if (recentErrors[errorKey]) {
    return;
  }

  // Mark this error as seen and schedule cleanup
  recentErrors[errorKey] = true;
  clearErrorAfterDelay(errorKey);

  try {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      // Wrap postMessage in a try-catch to prevent it from causing unhandled rejections
      try {
        window.parent.postMessage({
          type: 'EXPO_ERROR',
          level: level,
          message: message,
          data: data,
          timestamp: new Date().toISOString(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          source: 'expo-template'
        }, '*');
      } catch (postError) {
        // Silently fail if postMessage doesn't work
        console.log('Could not send error to parent window');
      }
    } else {
      // Fallback to console if no parent window
      console.error('🚨 ERROR (no parent):', level, message, data);
    }
  } catch (error) {
    // Silently fail to prevent cascading errors
    console.log('Error logging failed');
  }
};

// Function to extract meaningful source location from stack trace
const extractSourceLocation = (stack: string): string => {
  if (!stack) return '';

  // Look for various patterns in the stack trace
  const patterns = [
    // Pattern for app files: app/filename.tsx:line:column
    /at .+\/(app\/[^:)]+):(\d+):(\d+)/,
    // Pattern for components: components/filename.tsx:line:column
    /at .+\/(components\/[^:)]+):(\d+):(\d+)/,
    // Pattern for any .tsx/.ts files
    /at .+\/([^/]+\.tsx?):(\d+):(\d+)/,
    // Pattern for bundle files with source maps
    /at .+\/([^/]+\.bundle[^:]*):(\d+):(\d+)/,
    // Pattern for any JavaScript file
    /at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/
  ];

  for (const pattern of patterns) {
    const match = stack.match(pattern);
    if (match) {
      return ` | Source: ${match[1]}:${match[2]}:${match[3]}`;
    }
  }

  // If no specific pattern matches, try to find any file reference
  const fileMatch = stack.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+)/);
  if (fileMatch) {
    return ` | Source: ${fileMatch[1]}:${fileMatch[2]}`;
  }

  return '';
};

// Function to get caller information from stack trace
const getCallerInfo = (): string => {
  try {
    const stack = new Error().stack || '';
    const lines = stack.split('\n');

    // Skip the first few lines (Error, getCallerInfo, console override)
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      if (line.indexOf('app/') !== -1 || line.indexOf('components/') !== -1 || line.indexOf('.tsx') !== -1 || line.indexOf('.ts') !== -1) {
        const match = line.match(/at .+\/([^/\s:)]+\.[jt]sx?):(\d+):(\d+)/);
        if (match) {
          return ` | Called from: ${match[1]}:${match[2]}:${match[3]}`;
        }
      }
    }
  } catch (error) {
    // Silently fail if stack trace parsing fails
  }

  return '';
};

export const setupErrorLogging = () => {
  // Capture unhandled errors in web environment
  if (typeof window !== 'undefined') {
    // Override window.onerror to catch JavaScript errors
    const originalOnError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      try {
        const sourceFile = source ? source.split('/').pop() : 'unknown';
        const errorData = {
          message: message,
          source: `${sourceFile}:${lineno}:${colno}`,
          line: lineno,
          column: colno,
          error: error?.stack || error,
          timestamp: new Date().toISOString()
        };

        console.error('🚨 RUNTIME ERROR:', errorData);
        sendErrorToParent('error', 'JavaScript Runtime Error', errorData);
      } catch (err) {
        console.log('Error in error handler');
      }
      
      // Call original handler if it exists
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error);
      }
      return false; // Don't prevent default error handling
    };

    // Check if platform is web
    if (Platform.OS === 'web') {
      // Capture unhandled promise rejections
      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        try {
          // Prevent the default handling (which logs to console)
          event.preventDefault();
          
          const errorData = {
            reason: event.reason,
            promise: 'Promise rejected',
            timestamp: new Date().toISOString()
          };

          console.error('🚨 UNHANDLED PROMISE REJECTION:', errorData);
          sendErrorToParent('error', 'Unhandled Promise Rejection', errorData);
        } catch (err) {
          console.log('Error handling promise rejection');
        }
      };

      // Remove any existing listener first
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      // Add the new listener
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
    }
  }

  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;

  // UNCOMMENT BELOW CODE TO GET MORE SENSITIVE ERROR LOGGING (usually many errors triggered per 1 uncaught runtime error)

  // Override console.error to capture more detailed information
  // console.error = (...args: any[]) => {
  //   try {
  //     const stack = new Error().stack || '';
  //     const sourceInfo = extractSourceLocation(stack);
  //     const callerInfo = getCallerInfo();

  //     // Create enhanced message with source information
  //     const enhancedMessage = args.join(' ') + sourceInfo + callerInfo;

  //     // Add timestamp and make it stand out in Metro logs
  //     originalConsoleError('🔥🔥🔥 ERROR:', new Date().toISOString(), enhancedMessage);

  //     // Also send to parent
  //     sendErrorToParent('error', 'Console Error', enhancedMessage);
  //   } catch (err) {
  //     originalConsoleError(...args);
  //   }
  // };

  // Override console.warn to capture warnings with source location
  // console.warn = (...args: any[]) => {
  //   try {
  //     const stack = new Error().stack || '';
  //     const sourceInfo = extractSourceLocation(stack);
  //     const callerInfo = getCallerInfo();

  //     // Create enhanced message with source information
  //     const enhancedMessage = args.join(' ') + sourceInfo + callerInfo;

  //     originalConsoleWarn('⚠️ WARNING:', new Date().toISOString(), enhancedMessage);

  //     // Also send to parent
  //     sendErrorToParent('warn', 'Console Warning', enhancedMessage);
  //   } catch (err) {
  //     originalConsoleWarn(...args);
  //   }
  // };

  // // Also override console.log to catch any logs that might contain error information
  // console.log = (...args: any[]) => {
  //   try {
  //     const message = args.join(' ');

  //     // Check if this log message contains warning/error keywords
  //     if (message.indexOf('deprecated') !== -1 || message.indexOf('warning') !== -1 || message.indexOf('error') !== -1) {
  //       const stack = new Error().stack || '';
  //       const sourceInfo = extractSourceLocation(stack);
  //       const callerInfo = getCallerInfo();

  //       const enhancedMessage = message + sourceInfo + callerInfo;

  //       originalConsoleLog('📝 LOG (potential issue):', new Date().toISOString(), enhancedMessage);
  //       sendErrorToParent('info', 'Console Log (potential issue)', enhancedMessage);
  //     } else {
  //       // Normal log, just pass through
  //       originalConsoleLog(...args);
  //     }
  //   } catch (err) {
  //     originalConsoleLog(...args);
  //   }
  // };

  console.log('✅ Error logging initialized');
};
