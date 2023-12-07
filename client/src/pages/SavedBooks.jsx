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
  const { loading, data } = useQuery(QUERY_ME);
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);

  const userData = data?.me || {};

  // use this to determine if `useEffect()` hook needs to run again
  // const userDataLength = Object.keys(userData).length;

  const handleDeleteBook = async (bookId) => {
    const taken = Auth.loggedIn() ? Auth.getToken() : null;
    console.log(taken);
    if (!taken) {
      return false;
    }

    try {
      await removeBook({
        variables: { bookId },
      });
      console.log(data);
      console.log(bookId);
      removeBookId(bookId);
      const bookElement = document.getElementById(bookId);
        if (bookElement) {
          bookElement.remove();
        } else {
          console.warn(`Element with id ${bookId} not found.`);
        }
      
      let counter = document.getElementById('counter');
      let currentCount = parseInt(counter.innerText.split(' ')[1]);
      if (currentCount === 0) {
        counter.innerText = `You have ${currentCount - 1} saved books!`;
      } else {
        counter.innerText = `Viewing ${currentCount - 1} saved ${currentCount === 1 ? 'book' : 'books'}`;
      }
      document.window.location.reload();
    } catch (err) {
        console.error(err);
      }
    };


  // if data isn't here yet, say so
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
        {userData.savedBooks && userData.savedBooks.length > 0
          ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
          : 'You have no saved books!'}
        </h2>
        <Row>
        {userData.savedBooks && userData.savedBooks.length > 0 ? (
          userData.savedBooks.map((book) => {
            return (
              <Col key={book.bookId} md="4">
                <Card key={book.bookId} border='dark'>
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
            <p>You have no saved books!</p>
          )}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
