import React from 'react';
import { HistoryPage } from './HistoryPage';
import { PageId } from '../../types';

interface DashboardProps {
  onSelectPage: (page: PageId) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectPage }) => {
  return <HistoryPage onSelectPage={onSelectPage} />;
};
