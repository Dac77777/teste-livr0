# n8n Book Creation Workflow Documentation

## 1. Workflow Overview

This n8n workflow automates the process of creating a book in Markdown format. It interactively prompts the user for book details (title, author, number of chapters) and then for each chapter's title and content. Finally, it assembles all this information into a single Markdown (.md) file and uploads it to a specified folder in Google Drive.

This workflow is defined in the `workflow.n8n.json` file.

## 2. Prerequisites

Before using this workflow, ensure you have:

*   **An n8n Instance:** A running instance of n8n where you can import and execute workflows.
*   **Google Account:** A Google account with access to Google Drive.
*   **Google Drive API Setup:** You must have configured Google Drive API access for n8n. Follow the detailed instructions in the `n8n_google_drive_setup_guide.md` document. This includes creating Google Cloud credentials and setting up OAuth 2.0.
*   **Workflow Imported:** The `workflow.n8n.json` file must be imported into your n8n instance.
*   **Google Drive Folder ID Configured:** The "Upload to Google Drive" node within the workflow needs to be configured with a valid Google Drive Folder ID where the generated book files will be stored. See the "Upload to Google Drive" node explanation below for details.

## 3. Node-by-Node Explanation

This section details each node used in the workflow, its purpose, and key configurations. Node names are taken from `workflow.n8n.json`.

---

### 1. Manual Trigger
*   **Node Type:** `n8n-nodes-base.manualTrigger`
*   **Purpose:** This node allows you to start the workflow manually from the n8n editor by clicking the "Execute Workflow" or "Play" button.
*   **Key Configurations:** None specific to this workflow; it's a standard trigger.

---

### 2. Book Details Input
*   **Node Type:** `n8n-nodes-base.userInput`
*   **Purpose:** Prompts the user to enter the main details of the book.
*   **Key Configurations:**
    *   **Fields:**
        *   `bookTitle`: (String) Label: "Book Title". For the title of the book.
        *   `bookAuthor`: (String) Label: "Book Author". For the author's name.
        *   `numChapters`: (Number) Label: "Number of Chapters". Determines how many times the subsequent chapter input loop will run. Default: 1.
*   **Output:** An item containing `bookTitle`, `bookAuthor`, and `numChapters`.

---

### 3. Loop Over Chapters
*   **Node Type:** `n8n-nodes-base.loopOverNumbers`
*   **Purpose:** This node iterates a specific number of times, once for each chapter of the book. The number of iterations is determined by the `numChapters` input from the "Book Details Input" node.
*   **Key Configurations:**
    *   **Count:** Set to `{{ $json.numChapters }}`. This expression dynamically takes the value provided for "Number of Chapters" from the "Book Details Input" node.
*   **Output:** For each iteration, it outputs an item containing a `value` (the current iteration number, starting from 1 by default if "Start" is 1). This value is used in subsequent nodes to label inputs for the current chapter.

---

### 4. Chapter Title Input
*   **Node Type:** `n8n-nodes-base.userInput`
*   **Purpose:** Prompts the user to enter the title for each chapter. This node executes once for each iteration of the "Loop Over Chapters" node.
*   **Key Configurations:**
    *   **Fields:**
        *   `chapterTitle_current`: (String) Label: "Chapter Title (Chapter `{{ $getInput(1).item.json.value }}`)". The label dynamically displays the current chapter number based on the output of the "Loop Over Chapters" node.
*   **Output:** An item containing `chapterTitle_current` for the current chapter.

---

### 5. Chapter Content Input
*   **Node Type:** `n8n-nodes-base.userInput`
*   **Purpose:** Prompts the user to enter the content for each chapter. This node also executes once for each iteration of the "Loop Over Chapters" node, following the "Chapter Title Input".
*   **Key Configurations:**
    *   **Fields:**
        *   `chapterContent_current`: (String) Label: "Chapter Content (Chapter `{{ $getInput(1).item.json.value }}`)". The label dynamically displays the current chapter number. The input field is typically a multi-line text area.
*   **Output:** An item containing `chapterContent_current` for the current chapter.

---

### 6. Assemble Markdown
*   **Node Type:** `n8n-nodes-base.function`
*   **Purpose:** This is the core node for content aggregation. It takes all the previously collected data (book details and all chapter titles/contents) and constructs a single Markdown string.
*   **Key Configurations:**
    *   **Function Code (JavaScript):**
        ```javascript
        // Retrieve book details.
        const bookDetailsNode = $('Book Details Input');
        const bookTitle = bookDetailsNode.item.json.bookTitle;
        const bookAuthor = bookDetailsNode.item.json.bookAuthor;

        let markdownContent = `# ${bookTitle}\\n\\n`;
        markdownContent += `**By: ${bookAuthor}**\\n\\n`;
        markdownContent += `---\\n\\n`;

        // 'items' here are the result of the loop (from Chapter Content Input)
        // Each item contains data from one iteration of the loop.
        for (const item of items) {
          const chapterTitle = item.json.chapterTitle_current;
          const chapterContent = item.json.chapterContent_current;

          if (chapterTitle) {
            markdownContent += `## ${chapterTitle}\\n\\n`;
          }
          if (chapterContent) {
            markdownContent += `${chapterContent}\\n\\n`;
          }
          markdownContent += `---\\n\\n`;
        }

        // Return a new item with the complete markdown string and filename
        return [{ json: { finalMarkdown: markdownContent, bookFileName: `${bookTitle}.md` } }];
        ```
*   **Output:** A single item containing:
    *   `finalMarkdown`: The complete book content as a Markdown string.
    *   `bookFileName`: The generated filename for the book (e.g., `Book Title.md`).

---

### 7. Upload to Google Drive
*   **Node Type:** `n8n-nodes-google.drive`
*   **Purpose:** Uploads the generated Markdown content as a .md file to the user's Google Drive.
*   **Key Configurations:**
    *   **Credential:** Requires Google Drive API credentials (see Prerequisites).
    *   **Operation:** `Upload`
    *   **Binary Data:** `true` (as we are uploading file content).
    *   **File Content:** `{{ $json.finalMarkdown }}` (takes the Markdown string from the "Assemble Markdown" node).
    *   **File Name:** `{{ $json.bookFileName }}` (takes the filename from the "Assemble Markdown" node).
    *   **Parent Folder ID:** (Field: `parent`) **This MUST be configured by the user.** It's the ID of the Google Drive folder where the file will be uploaded. You can get this ID from the URL when you open the folder in Google Drive (e.g., `https://drive.google.com/drive/folders/YOUR_FOLDER_ID`).
    *   **MIME Type:** `text/markdown` (ensures Google Drive recognizes it as a Markdown file).
*   **Output:** Data about the uploaded file from Google Drive.

---

## 4. Data Flow Summary

1.  The **Manual Trigger** initiates the workflow.
2.  **Book Details Input** collects `bookTitle`, `bookAuthor`, and `numChapters`.
3.  This data flows to the **Loop Over Chapters** node, which uses `numChapters` to control its iterations.
4.  For each iteration, the **Loop Over Chapters** node passes its current iteration number to:
    *   **Chapter Title Input**, which collects `chapterTitle_current`.
    *   **Chapter Content Input**, which collects `chapterContent_current`.
5.  The outputs from all iterations of **Chapter Content Input** (each containing `chapterTitle_current` from its preceding "Chapter Title Input" and its own `chapterContent_current` due to n8n's data merging) are passed as an array of items to the **Assemble Markdown** (Function) node.
6.  The **Assemble Markdown** node also accesses the initial `bookTitle` and `bookAuthor` directly from the "Book Details Input" node's output. It then iterates through the array of chapter data, formats everything into a single Markdown string, and generates a filename.
7.  The resulting `finalMarkdown` and `bookFileName` are passed to the **Upload to Google Drive** node, which uploads the file.

## 5. Customization Tips

*   **Changing Target Google Drive Folder:**
    *   The most common customization. Open the "Upload to Google Drive" node and change the value in the **Parent Folder ID** field to your desired Google Drive folder's ID.
*   **Modifying Input Fields:**
    *   To add more book details (e.g., ISBN, publication year):
        *   Open the "Book Details Input" node.
        *   Click "Add Field" to add new input fields. Note their property names.
        *   Modify the Function node ("Assemble Markdown") to retrieve and include these new fields in the Markdown string (e.g., `const isbn = bookDetailsNode.item.json.isbn; markdownContent += `ISBN: ${isbn}\\n\\n`;`).
    *   To add more per-chapter details (e.g., chapter summary):
        *   Add a new "User Input" node after "Chapter Content Input" within the loop structure (connect "Chapter Content Input" to it, and it to "Assemble Markdown").
        *   Define fields in this new User Input node.
        *   Modify the Function node ("Assemble Markdown") to access this new data from each item in the `items` array (e.g., `const chapterSummary = item.json.chapterSummary_current;`).
*   **Altering Markdown Structure:**
    *   The entire Markdown formatting is controlled by the JavaScript code in the "Assemble Markdown" (Function) node.
    *   You can change heading levels (e.g., `###` instead of `##` for chapters), add different separators, include a table of contents (more complex), or change any part of the text structure.
*   **Using a Different File Storage Service:**
    *   Replace the "Upload to Google Drive" node with a node for a different service (e.g., Dropbox, OneDrive, FTP).
    *   You'll need to configure credentials for the new service.
    *   The new node will likely require similar inputs (file content, filename), which `finalMarkdown` and `bookFileName` from the "Assemble Markdown" node can provide.
*   **Changing Filename Convention:**
    *   Modify the line `bookFileName: \`\${bookTitle}.md\`` in the "Assemble Markdown" node to change how filenames are generated. For example, you could include the author: `bookFileName: \`\${bookTitle} - \${bookAuthor}.md\``.

## 6. Basic Troubleshooting

Refer to the `n8n_workflow_test_plan.md` for detailed test cases. Here are some common troubleshooting tips:

*   **Workflow Not Starting:** Ensure the "Manual Trigger" is connected to the "Book Details Input" node.
*   **Incorrect Number of Chapter Prompts:** Double-check the value entered for "Number of Chapters" in the "Book Details Input". Verify the `Count` parameter in the "Loop Over Chapters" node is correctly set to `{{ $json.numChapters }}`.
*   **Errors in "Assemble Markdown" (Function Node):**
    *   Check if the node is receiving the expected input data. Click on the node after execution and view the "Input Data". Ensure book details and an array of chapter items are present.
    *   Verify JavaScript syntax. Small typos can cause errors. n8n usually shows error messages indicating the problematic line.
    *   Ensure property names used to access data (e.g., `item.json.chapterTitle_current`, `bookDetailsNode.item.json.bookTitle`) exactly match what previous nodes provide.
*   **"Upload to Google Drive" Node Errors:**
    *   **Authentication:** This is the most common issue. Re-authenticate your Google credential in n8n. Ensure you followed `n8n_google_drive_setup_guide.md` correctly, especially the Redirect URI.
    *   **Invalid Folder ID:** Ensure the "Parent Folder ID" is correct and the authenticated user has write permissions to that folder.
    *   **File Not Found/API Errors:** The error message in the node output often gives clues. It could be related to permissions, an invalid filename (though less common for Markdown), or temporary Google Drive API issues.
*   **Checking Node Execution Data:**
    *   After a workflow execution, click on any node. You can inspect its "Input Data" and "Output Data" (or "JSON" tabs) to understand what data it received and produced. This is invaluable for tracing where a problem might have occurred.
*   **Markdown Formatting Issues:** If the output .md file doesn't look right, the issue is almost certainly in the JavaScript code of the "Assemble Markdown" node. Carefully review the string concatenation and Markdown syntax used.

By systematically checking node inputs, outputs, and configurations, most issues can be identified and resolved.
---
