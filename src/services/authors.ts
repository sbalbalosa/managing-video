import { AuthorResponse } from '../models/author';

const path = `${process.env.REACT_APP_API}/authors`;
const headers = {
  'Content-Type': 'application/json',
};

export const getAuthors = (): Promise<AuthorResponse[]> => {
  return fetch(path).then((response) => (response.json() as unknown) as AuthorResponse[]);
};

export const updateAuthor = (author: AuthorResponse): Promise<AuthorResponse> => {
  const { id, ...payload } = author;
  return fetch(`${path}/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  }).then((response) => (response.json() as unknown) as AuthorResponse);
};

export const getAuthorById = (id: AuthorResponse['id']): Promise<AuthorResponse> => {
  return fetch(`${path}/${id}`).then((response) => (response.json() as unknown) as AuthorResponse);
};

export const searchAuthors = (searchTerm: string): Promise<AuthorResponse[]> => {
  return fetch(`${path}?q=${searchTerm}`).then((response) => (response.json() as unknown) as AuthorResponse[]);
};
