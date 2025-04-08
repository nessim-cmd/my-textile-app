import Wrapper from '@/components/Wrapper';
import { Suspense } from 'react';
import EntriesClient from './EntriesClient';

export default function ProductionTimeEntriesPage() {
  return (
    <Wrapper>
      <Suspense fallback={<div className="text-center"><span className="loading loading-dots loading-lg"></span></div>}>
        <EntriesClient />
      </Suspense>
    </Wrapper>
  );
}