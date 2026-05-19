import { getBooks } from '../data/books';
import { getNotes } from '../data/notes';
import { getCollections } from '../data/collections';
import { getReadingPlans } from '../data/readingPlans';
import { getDeletedBooks } from '../data/deletedBooks';
import { getDeletedNotes } from '../data/deletedNotes';

export function prefetchUserData() {
  void Promise.allSettled([
    getBooks(),
    getNotes(),
    getCollections(),
    getReadingPlans(),
    getDeletedBooks(),
    getDeletedNotes()
  ]);
}
