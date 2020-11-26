import React from 'react';
import SentimentVeryDissatisfiedIcon from '@material-ui/icons/SentimentVeryDissatisfied';
import { GridOverlay } from '@material-ui/data-grid';

export const NoRecord: React.FC = () => {
  return (
    <GridOverlay>
      <SentimentVeryDissatisfiedIcon /> No videos found.
    </GridOverlay>
  );
};
