/**
 * Server-side environment logger for debugging during development
 * Only runs in development mode and logs environment variables at server startup
 */

interface EnvironmentCategory {
  name: string;
  icon: string;
  variables: Record<string, string>;
}

interface ServerEnvironmentInfo {
  timestamp: string;
  workingDirectory: string;
  nodeEnv: string;
  categories: EnvironmentCategory[];
  totalCount: number;
}

/**
 * Masks sensitive values in environment variables
 */
function maskSensitiveValue(key: string, value: string): string {
  const sensitiveKeys = ['key', 'secret', 'token', 'password', 'auth'];
  const isSensitive = sensitiveKeys.some(sensitiveKey => 
    key.toLowerCase().includes(sensitiveKey)
  );
  
  if (!isSensitive || !value || value.length < 8) {
    return value;
  }
  
  return value.substring(0, 4) + '****' + value.substring(value.length - 4);
}

/**
 * Categorizes environment variables into logical groups
 */
function categorizeEnvironmentVariables(): EnvironmentCategory[] {
  const env = process.env;
  const categories: EnvironmentCategory[] = [];
  
  // NEXT_PUBLIC_* variables
  const nextPublicVars: Record<string, string> = {};
  
  // Firebase-related variables
  const firebaseVars: Record<string, string> = {};
  
  // Other development variables
  const otherVars: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(env)) {
    if (!value) continue;
    
    const maskedValue = maskSensitiveValue(key, value);
    
    if (key.startsWith('NEXT_PUBLIC_')) {
      nextPublicVars[key] = maskedValue;
    } else if (key.includes('FIREBASE') || key.includes('FIRE_')) {
      firebaseVars[key] = maskedValue;
    } else if (['NODE_ENV', 'PORT', 'HOSTNAME', 'PWD'].includes(key)) {
      otherVars[key] = maskedValue;
    }
  }
  
  if (Object.keys(nextPublicVars).length > 0) {
    categories.push({
      name: 'Next.js Public Variables',
      icon: '🌐',
      variables: nextPublicVars
    });
  }
  
  if (Object.keys(firebaseVars).length > 0) {
    categories.push({
      name: 'Firebase Variables',
      icon: '🔥',
      variables: firebaseVars
    });
  }
  
  if (Object.keys(otherVars).length > 0) {
    categories.push({
      name: 'Development Variables',
      icon: '⚙️',
      variables: otherVars
    });
  }
  
  return categories;
}

/**
 * Gets comprehensive server environment information
 */
function getServerEnvironmentInfo(): ServerEnvironmentInfo {
  const categories = categorizeEnvironmentVariables();
  const totalCount = categories.reduce((sum, cat) => sum + Object.keys(cat.variables).length, 0);
  
  return {
    timestamp: new Date().toISOString(),
    workingDirectory: process.cwd(),
    nodeEnv: process.env.NODE_ENV || 'unknown',
    categories,
    totalCount
  };
}

/**
 * Logs server environment information to the console
 * Only runs in development mode
 */
export function logServerEnvironment(): void {
  // Only log in development mode
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  const envInfo = getServerEnvironmentInfo();
  
  console.log('\n' + '='.repeat(60));
  console.group('🖥️  Server-Side Environment Debug Info');
  console.log('📅 Timestamp:', envInfo.timestamp);
  console.log('🌍 Node Environment:', envInfo.nodeEnv);
  console.log('📁 Working Directory:', envInfo.workingDirectory);
  console.log('📊 Total Environment Variables:', envInfo.totalCount);
  console.log('');
  
  // Log each category
  envInfo.categories.forEach(category => {
    console.group(`${category.icon} ${category.name} (${Object.keys(category.variables).length})`);
    
    Object.entries(category.variables).forEach(([key, value]) => {
      console.log(`   ${key}:`, value);
    });
    
    console.groupEnd();
  });
  
  console.groupEnd();
  console.log('='.repeat(60) + '\n');
}

/**
 * Initialize server environment logging
 * Call this at server startup to log environment variables
 */
export function initializeServerEnvironmentLogging(): void {
  if (process.env.NODE_ENV === 'development') {
    // Log immediately when called
    logServerEnvironment();
    
    // Also log a startup message
    console.log('🚀 Server-side environment logging initialized for development mode');
  }
}