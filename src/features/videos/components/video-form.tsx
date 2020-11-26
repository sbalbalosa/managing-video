import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Paper, Button, TextField, Container, FormControl, InputLabel, Select, FormHelperText, MenuItem, Box } from '@material-ui/core';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useParams } from '@reach/router';
import { ErrorMessage } from '@hookform/error-message';

import { isCategoriesUpdating, allCategories } from '../../categories/categoriesSlice';
import { allAuthors, isAuthorsUpdating } from '../../authors/authorsSlice';
import { videosLookup, fetchVideos, saveVideo } from '../../videos/videosSlice';
import { VideoEntity, videoSchema } from '../../../models/video';

export const VideoForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const videos = useSelector(videosLookup);
  const authors = useSelector(allAuthors);
  const categories = useSelector(allCategories);
  const categoriesLoading = useSelector(isCategoriesUpdating);
  const authorsLoading = useSelector(isAuthorsUpdating);

  const isLoading = categoriesLoading || authorsLoading;
  const selectedVideo = params.id && videos[params.id];

  const { register, errors, handleSubmit, control, reset } = useForm({
    resolver: yupResolver(videoSchema, { strict: true, abortEarly: false }),
  });

  const onSubmit = (data: VideoEntity) => {
    const payload = selectedVideo && { id: selectedVideo.id };
    dispatch(saveVideo({ ...data, ...(payload || {}) }));
    navigate('/videos');
  };

  useEffect(() => {
    if (!selectedVideo) {
      dispatch(fetchVideos());
    }
  }, [dispatch, selectedVideo]);

  useEffect(() => {
    if (selectedVideo) {
      reset({
        id: selectedVideo.id || '',
        name: selectedVideo.name || '',
        authorId: selectedVideo.authorId,
        catIds: selectedVideo ? selectedVideo.catIds : [],
      });
    }
  }, [selectedVideo, reset]);

  return (
    <Container maxWidth="sm">
      <Box component={Paper} mt={5} p={4}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {!isLoading ? <h1>{selectedVideo ? 'Edit' : 'Add'} video</h1> : null}
          <Box display="flex" mb={6} flexDirection="column" height={300} justifyContent="space-around">
            <Controller
              name="name"
              control={control}
              defaultValue=""
              as={
                <TextField
                  label="Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  FormHelperTextProps={{
                    error: true,
                  }}
                />
              }></Controller>
            {!authorsLoading ? (
              <FormControl>
                <InputLabel>Author</InputLabel>
                <Controller
                  name="authorId"
                  control={control}
                  defaultValue=""
                  as={
                    <Select inputRef={register} error={!!errors.authorId}>
                      {authors.map((x) => (
                        <MenuItem key={x.id} value={x.id}>
                          {x.name}
                        </MenuItem>
                      ))}
                    </Select>
                  }></Controller>
                <FormHelperText error>
                  <ErrorMessage name="authorId" errors={errors} />
                </FormHelperText>
              </FormControl>
            ) : (
              <p>Loading...</p>
            )}
            {!categoriesLoading ? (
              <FormControl>
                <InputLabel>Category</InputLabel>
                <Controller
                  name="catIds"
                  control={control}
                  defaultValue={[]}
                  as={
                    <Select multiple error={!!errors.catIds}>
                      {categories.map((x) => (
                        <MenuItem key={x.id} value={x.id}>
                          {x.name}
                        </MenuItem>
                      ))}
                    </Select>
                  }></Controller>
                <FormHelperText error>
                  <ErrorMessage name="catIds" errors={errors} />
                </FormHelperText>
              </FormControl>
            ) : (
              <p>Loading...</p>
            )}
          </Box>
          <Box display="flex" flexDirection="row" justifyContent="flex-end">
            <Box mr={2} clone>
              <Link to="/videos">Cancel</Link>
            </Box>
            <Button variant="contained" color="primary" disabled={isLoading} type="submit">
              Save
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};
