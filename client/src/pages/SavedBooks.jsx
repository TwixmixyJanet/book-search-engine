import {
  Container,
  Card,
  Button,
  Row,
  Col
} from 'react-bootstrap';

import { useMutation, useQuery } from '@apollo/client';
import { REMOVE_BOOK } from '../utils/mutations';
import { QUERY_ME } from '../utils/queries';

import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  // Fetch user data using the useQuery hook and the QUERY_ME query
  const { loading, data } = useQuery(QUERY_ME);
  // Define mutation for removing a book and triggering a refetch of the QUERY_ME query
  const [removeBook, { error }] = useMutation(REMOVE_BOOK, {
    refetchQueries: [{ query: QUERY_ME }],
  });
  
  // Extract user data from the hook results
  const userData = data?.me || {};

  // Define the function to handle deleting a book
  const handleDeleteBook = async (bookId) => {
    // Check if the user is logged in and get the token
    const token = Auth.loggedIn() ? Auth.getToken() : null;
  
    // If the user if not logged in, do nothing
    if (!token) {
      return false;
    }
  
    try {
      // Invoke the removeBook mutation with the bookId as a variable
      await removeBook({
        variables: { bookId },
      });
  
      // Update local storage with the removed bookId
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };
  
  // If data is still loading, display a loading message
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
        {/* Display the number of saved books or a message if none */}
        {userData.savedBooks && userData.savedBooks.length > 0
          ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
          : 'You have no saved books!'}
        </h2>
        <Row>
          {/* Display saved books or a message if none */}
        {userData.savedBooks && userData.savedBooks.length > 0 ? (
          userData.savedBooks.map((book) => {
            return (
              <Col key={book.bookId} md="4">
                <Card key={book.bookId} border='dark'>
                  {/* Display book image, if available */}
                  {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })) : (
            // Display a message if there are no books saved
            <p>You have no saved books!</p>
          )}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
