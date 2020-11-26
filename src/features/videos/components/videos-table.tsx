import React, { useEffect, useState } from 'react';
import { useDebounceCallback } from '@react-hook/debounce';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Box,
} from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from '@reach/router';

import { allVideos, fetchVideos, isVideosLoading, fetchVideoBySearch } from '../videosSlice';
import { deleteVideoFromAuthor } from '../../authors/authorsSlice';

export const renderLoading = (): React.ReactElement => {
  return (
    <>
      <TableRow>
        <TableCell colSpan={4}>
          <Box display="flex" height={400} justifyContent="center" alignItems="center">
            <CircularProgress />
          </Box>
        </TableCell>
      </TableRow>
    </>
  );
};

export const VideosTable: React.FC = () => {
  const [dialogState, setDialogState] = useState({
    open: false,
    id: -1,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isTypingSearch, setIsTypingSearch] = useState(false);
  const dispatch = useDispatch();
  const videos = useSelector(allVideos);
  const videosLoading = useSelector(isVideosLoading);

  const handleSearch = useDebounceCallback((search: string): void => {
    setIsTypingSearch(false);
    if (search !== '') {
      dispatch(fetchVideoBySearch(search));
    }
  }, 500);

  const handleClearSearch = (): void => {
    setSearchTerm('');
    setIsTypingSearch(false);
  };

  const handleTypingSearch = (search: string): void => {
    setIsTypingSearch(true);
    setSearchTerm(search);
  };

  useEffect(() => {
    if (isTypingSearch) {
      handleSearch(searchTerm);
    } else {
      dispatch(fetchVideos());
    }
  }, [dispatch, searchTerm, isTypingSearch, handleSearch]);

  const handleClickOpen = (id: number) => {
    setDialogState({
      open: true,
      id,
    });
  };

  const handleClose = () => {
    setDialogState({
      open: false,
      id: -1,
    });
  };

  return (
    <>
      <Dialog
        open={dialogState.open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">Do you want to delete this video?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">This record will be gone forever.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => {
              dispatch(deleteVideoFromAuthor(dialogState.id));
              handleClose();
            }}
            color="primary"
            autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Box mt={5}>
        <form noValidate autoComplete="off">
          <Box display="flex" justifyContent="space-between">
            <Box width={500}>
              <Box mr={2} clone>
                <TextField
                  id="standard-basic"
                  label="Search"
                  variant="outlined"
                  size="small"
                  onChange={(e) => handleTypingSearch(e.target.value)}
                  value={searchTerm}
                />
              </Box>
              {searchTerm !== '' ? (
                <Button variant="outlined" onClick={handleClearSearch}>
                  Clear search
                </Button>
              ) : null}
            </Box>
            <Link to="/videos/new">New</Link>
          </Box>
        </form>
        <Box mt={3}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Video Name</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Categories</TableCell>
                  <TableCell>Options</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {videosLoading || isTypingSearch ? (
                  renderLoading()
                ) : videos.length > 0 ? (
                  videos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell component="th" scope="row">
                        {video.name}
                      </TableCell>
                      <TableCell>{video.author.name}</TableCell>
                      <TableCell>{video.categories.map((x) => x.name).join(', ')}</TableCell>
                      <TableCell>
                        <Box mr={2} clone>
                          <Link to={`/videos/${video.id}/${video.author.id}`}>
                            <Button>Edit</Button>
                          </Link>
                        </Box>
                        <Button onClick={() => handleClickOpen(video.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Box display="flex" justifyContent="center">
                        No video result.
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </>
  );
};
