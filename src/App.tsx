import React from 'react';
import { AppBar, Container, Toolbar, Typography } from '@material-ui/core';
import { VideosTable } from './features/videos/components/videos-table';
import { VideoForm } from './features/videos/components/video-form';
import { Router, RouteComponentProps } from '@reach/router';

const Home = (props: RouteComponentProps) => <VideosTable />;
const Form = (props: RouteComponentProps) => <VideoForm />;
const App: React.FC = () => {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Video Manager</Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <Router>
          <Home path="/"></Home>
          <Home path="videos"></Home>
          <Form path="videos/:id/:authorId" />
          <Form path="videos/new" />
        </Router>
      </Container>
    </>
  );
};

export default App;
