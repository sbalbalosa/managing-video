import React, { useEffect, useState } from 'react';
import { Button, Fade, Box, Chip } from '@material-ui/core';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from '@reach/router';
import { DataGrid, ColDef, ValueGetterParams } from '@material-ui/data-grid';

import { BaseDialog } from '../../../components/base-dialog';
import { allVideos, fetchVideos, isVideosLoading, fetchVideoBySearch } from '../videos-slice';
import { deleteVideoFromAuthor } from '../../authors/authors-slice';
import { VideoView } from '../../../models/video';
import { NoRecord } from '../../../components/no-record';
import { SearchInput } from '../../../components/search-input';

export const VideosTable: React.FC = () => {
  const [dialogState, setDialogState] = useState({
    open: false,
    id: -1,
  });
  // const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useDispatch();
  const videos = useSelector(allVideos);
  const videosLoading = useSelector(isVideosLoading);
  const navigate = useNavigate();

  const handleSearch = (search: string): void => {
    dispatch(fetchVideoBySearch(search));
  };

  const handleClear = (): void => {
    dispatch(fetchVideos());
  };

  useEffect(() => {
    dispatch(fetchVideos());
  }, [dispatch]);

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

  function getAuthor(params: ValueGetterParams) {
    return (params.getValue('author') as VideoView['author']).name;
  }

  const columns: ColDef[] = [
    { field: 'name', headerName: 'NAME', sortable: true, flex: 1 },
    {
      field: 'author',
      headerName: 'AUTHOR',
      sortable: true,
      valueGetter: getAuthor,
      flex: 1,
      sortComparator: (v1, v2, cellParams1, cellParams2) => getAuthor(cellParams1).localeCompare(getAuthor(cellParams2)),
    },
    {
      field: 'categories',
      headerName: 'CATEGORIES',
      sortable: false,
      flex: 2,
      renderCell: (params: ValueGetterParams) => {
        const categories = params.getValue('categories') as VideoView['categories'];
        return (
          <>
            {categories.map((x) => (
              <Box mr={1} clone>
                <Chip label={x.name} variant="outlined" size="small" color="primary" />
              </Box>
            ))}
          </>
        );
      },
    },
    {
      field: 'id',
      flex: 1,
      headerName: ' ',
      sortable: false,
      renderCell: (params: ValueGetterParams) => {
        const id = params.getValue('id') as VideoView['id'];
        const author = params.getValue('author') as VideoView['author'];
        return (
          <>
            <Box mr={2} clone>
              <Button variant="outlined" onClick={() => navigate(`/videos/${id}/${author.id}`)}>
                Edit
              </Button>
            </Box>
            <Button variant="outlined" onClick={() => handleClickOpen(id)}>
              Delete
            </Button>
          </>
        );
      },
    },
  ];

  return (
    <>
      <BaseDialog open={dialogState.open} onClose={handleClose} title="Delete video?" description="Deleted record will be gone forever.">
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
      </BaseDialog>
      <Box mt={5}>
        <Box display="flex" justifyContent="space-between">
          <Box width={400}>
            <SearchInput
              placeholder="Search for author or video name"
              timeout={500}
              onSearch={handleSearch}
              onClear={handleClear}
              onTyping={(isTyping) => setIsSearching(isTyping)}
            />
          </Box>
          <Button variant="contained" color="secondary" onClick={() => navigate('/videos/new')}>
            New video
          </Button>
        </Box>
        <Fade in={true}>
          <Box mt={2} height={700} display="flex">
            <DataGrid
              rows={videos}
              columns={columns}
              pageSize={10}
              loading={videosLoading || isSearching}
              disableSelectionOnClick
              components={{
                noRowsOverlay: NoRecord,
              }}
            />
          </Box>
        </Fade>
      </Box>
    </>
  );
};
