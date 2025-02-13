const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";

interface Book {
  id: string;
  volumeInfo: {
    title: string;
    authors: string[];
    description: string;
    imageLinks: {
      thumbnail: string;
    };
  };
}

export async function searchGoogleBooks(query: string) {
  try {
    const response = await fetch(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=40`,
    );
    const data = (await response.json()) as { items: Book[] };
    return data.items;
  } catch (error) {
    console.error("Error searching books:", error);
  }
}
