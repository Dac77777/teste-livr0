// Retrieve book details from the 'Book Details Input' node.
// The name 'Book Details Input' should match the actual node name in your n8n workflow.
// If your node for book details is named differently, adjust $('Book Details Input') accordingly.
const bookDetailsNode = $('Book Details Input'); 
const bookTitle = bookDetailsNode.item.json.bookTitle;
const bookAuthor = bookDetailsNode.item.json.bookAuthor; // Assuming 'bookAuthor' is the field name for author in the "Book Details Input" node

let markdownContent = `# ${bookTitle}\n\n`;
markdownContent += `**By: ${bookAuthor}**\n\n`;
markdownContent += `---\n\n`;

// 'items' is the default variable in a Function node holding an array of input items.
// This code assumes the Function node is connected directly after the loop that 
// collects chapter data (e.g., after a "Chapter Content Input" node which is part of a loop).
// Each 'item' in the 'items' array is expected to have a 'json' property containing 
// the output from one iteration of the loop, specifically 'chapterTitle_current' and 'chapterContent_current'.
for (const item of items) {
  const chapterTitle = item.json.chapterTitle_current; 
  const chapterContent = item.json.chapterContent_current;

  if (chapterTitle) {
    markdownContent += `## ${chapterTitle}\n\n`;
  }
  if (chapterContent) {
    markdownContent += `${chapterContent}\n\n`;
  }
  markdownContent += `---\n\n`;
}

const bookFileName = `${bookTitle}.md`;

// The Function node should return an array of items.
// Each item in that array should be an object with a 'json' property.
// This 'json' property will contain the actual output data of the node.
return [{ json: { finalMarkdown: markdownContent, bookFileName: bookFileName } }];
