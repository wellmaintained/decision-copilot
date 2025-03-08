import { Profiler, ProfilerOnRenderCallback, ReactNode } from 'react';

interface ConditionalProfilerProps {
  id: string;
  children: ReactNode;
  onRender?: ProfilerOnRenderCallback;
}

export function ConditionalProfiler({ 
  id, 
  children, 
  onRender = () => {} 
}: ConditionalProfilerProps) {
  // Check if profiler is enabled via environment variable
  const enableProfiler = process.env.NEXT_PUBLIC_ENABLE_PROFILER === 'true';

  if (!enableProfiler) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
} 