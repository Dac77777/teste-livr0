# Test Plan: n8n Book Creation Workflow

## 1. Introduction

This document outlines the test plan for the n8n workflow (`workflow.n8n.json`) designed to create a book in Markdown format from user inputs and upload it to Google Drive.

## 2. Prerequisites

Before starting the tests, please ensure the following:

*   **Workflow Imported:** The `workflow.n8n.json` file has been successfully imported into your n8n instance.
*   **Google Drive API Setup:** You have successfully configured Google Drive API access for n8n by following the `n8n_google_drive_setup_guide.md`. Ensure the Google account used has permissions to create files in the target Google Drive folder.
*   **Google Drive Node Configured with Folder ID:**
    *   Open the "Upload to Google Drive" node in the imported n8n workflow.
    *   Locate the **Parent Folder ID** parameter (field name `parent`).
    *   Enter a valid Google Drive Folder ID where the test files will be uploaded. To get a Folder ID, open the desired folder in Google Drive, and the ID is the last part of the URL (e.g., for `https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE`, the ID is `YOUR_FOLDER_ID_HERE`).
    *   Save the workflow.
*   **n8n Instance Running:** Your n8n instance is running and accessible.

## 3. Test Cases

For each test case, execute the workflow manually via the n8n editor. After each execution, check the Google Drive folder specified in the "Upload to Google Drive" node.

---

### Test Case 1: Basic Single-Chapter Book

*   **Objective:** Verify that a book with a single chapter can be created and uploaded correctly.
*   **Steps:**
    1.  Manually trigger the workflow in n8n.
    2.  When prompted by the "Book Details Input" node:
        *   Book Title: `My Test Book`
        *   Book Author: `John Doe`
        *   Number of Chapters: `1`
    3.  When prompted by the "Chapter Title Input" node (for Chapter 1):
        *   Chapter Title: `Introduction`
    4.  When prompted by the "Chapter Content Input" node (for Chapter 1):
        *   Chapter Content: `This is the first chapter of the book.`
    5.  Allow the workflow to complete.
*   **Expected Results:**
    *   The workflow completes successfully without errors in n8n.
    *   A file named `My Test Book.md` is created in the specified Google Drive folder.
    *   The content of `My Test Book.md` is:
        ```markdown
        # My Test Book

        **By: John Doe**

        ---

        ## Introduction

        This is the first chapter of the book.

        ---
        ```

---

### Test Case 2: Multi-Chapter Book

*   **Objective:** Verify that a book with multiple chapters is created and formatted correctly.
*   **Steps:**
    1.  Manually trigger the workflow.
    2.  "Book Details Input":
        *   Book Title: `Advanced Topics`
        *   Book Author: `Jane Smith`
        *   Number of Chapters: `2`
    3.  "Chapter Title Input" (Chapter 1):
        *   Chapter Title: `Chapter 1: The Beginning`
    4.  "Chapter Content Input" (Chapter 1):
        *   Chapter Content: `Content for the first chapter.`
    5.  "Chapter Title Input" (Chapter 2):
        *   Chapter Title: `Chapter 2: The Middle`
    6.  "Chapter Content Input" (Chapter 2):
        *   Chapter Content: `Content for the second chapter.`
    7.  Allow the workflow to complete.
*   **Expected Results:**
    *   Workflow completes successfully.
    *   A file named `Advanced Topics.md` is created in Google Drive.
    *   The content of `Advanced Topics.md` is:
        ```markdown
        # Advanced Topics

        **By: Jane Smith**

        ---

        ## Chapter 1: The Beginning

        Content for the first chapter.

        ---

        ## Chapter 2: The Middle

        Content for the second chapter.

        ---
        ```

---

### Test Case 3: Inputs with Special Characters

*   **Objective:** Verify that inputs containing special characters (e.g., `&, #, !, ?, "`, newlines) are handled correctly in the Markdown content and filename.
*   **Steps:**
    1.  Manually trigger the workflow.
    2.  "Book Details Input":
        *   Book Title: `Book with "Quotes" & Symbols!`
        *   Book Author: `Author & Co. #1`
        *   Number of Chapters: `1`
    3.  "Chapter Title Input" (Chapter 1):
        *   Chapter Title: `Chapter with !? & "Special" Title`
    4.  "Chapter Content Input" (Chapter 1):
        *   Chapter Content:
            ```
            This chapter includes:
            - Ampersands: &
            - Hashtags: #
            - Question marks: ?
            - Exclamations: !
            - "Quotes"
            - Newlines.
            ```
    5.  Allow the workflow to complete.
*   **Expected Results:**
    *   Workflow completes successfully.
    *   A file named `Book with "Quotes" & Symbols!.md` is created in Google Drive. (Note: Some operating systems or Drive itself might sanitize certain characters from filenames, but the workflow should pass them as is to the Drive node).
    *   The content of the .md file is:
        ```markdown
        # Book with "Quotes" & Symbols!

        **By: Author & Co. #1**

        ---

        ## Chapter with !? & "Special" Title

        This chapter includes:
        - Ampersands: &
        - Hashtags: #
        - Question marks: ?
        - Exclamations: !
        - "Quotes"
        - Newlines.

        ---
        ```

---

### Test Case 4: Edge Case - Zero Chapters

*   **Objective:** Verify the workflow's behavior when the number of chapters is set to zero.
*   **Steps:**
    1.  Manually trigger the workflow.
    2.  "Book Details Input":
        *   Book Title: `Book Without Chapters`
        *   Book Author: `Nobody`
        *   Number of Chapters: `0`
    3.  Allow the workflow to complete. (The "Chapter Title Input" and "Chapter Content Input" nodes should not appear).
*   **Expected Results:**
    *   Workflow completes successfully.
    *   A file named `Book Without Chapters.md` is created in Google Drive.
    *   The content of `Book Without Chapters.md` is (the loop for chapters shouldn't run, so no chapter sections):
        ```markdown
        # Book Without Chapters

        **By: Nobody**

        ---

        ---
        ```
        (Note: The trailing `---` comes from the initial separator and the one intended to be after each chapter. If the loop doesn't run, the Function node's `for...of` loop won't execute, so no chapter-specific `markdownContent += ...` lines will run. The final `---` might be there or not depending on precise function logic if the loop is empty. The provided function code in `workflow.n8n.json` will indeed produce two `---` because one is static and the loop for chapters won't add any chapter content or its own `---`.)

---

### Test Case 5: Google Drive Folder ID Error (Simulated)

*   **Objective:** Verify that the workflow reports an error if the Google Drive Folder ID is invalid.
*   **Steps:**
    1.  In the n8n workflow editor, open the "Upload to Google Drive" node.
    2.  Change the **Parent Folder ID** to a non-existent or clearly invalid ID (e.g., `INVALID_FOLDER_ID_12345`).
    3.  Save the workflow.
    4.  Manually trigger the workflow.
    5.  Provide any valid inputs for book details and a single chapter (as in Test Case 1).
        *   Book Title: `Folder Error Test`
        *   Book Author: `Tester`
        *   Number of Chapters: `1`
        *   Chapter Title: `Test Chapter`
        *   Chapter Content: `Test content.`
    6.  Allow the workflow to attempt completion.
*   **Expected Results:**
    *   The workflow execution fails.
    *   The "Upload to Google Drive" node in n8n shows an error state.
    *   The error message should indicate a problem with the Google Drive operation, likely related to an invalid folder ID or permissions (e.g., "File not found", "Folder not found", or similar API error).
    *   No file is created in Google Drive.
    *   **Important:** Remember to revert the **Parent Folder ID** in the "Upload to Google Drive" node to a valid ID after this test.

---

## 4. Basic Debugging Guidance

If any test case fails, or the workflow shows an error:

1.  **Check Node States:** In the n8n editor, after an execution, each node will have a color indicator:
    *   **Green:** The node executed successfully.
    *   **Red:** The node encountered an error.
    *   **Grey/Yellow (depending on n8n version/theme):** The node did not execute (e.g., due to a previous error or conditional logic).

2.  **Inspect Node Input/Output:**
    *   Click on a node to open its details.
    *   You can usually view tabs like "Input" and "Output" (or "JSON" for older nodes/versions).
    *   **Input Data:** Check if the node received the data you expected from the previous node(s). For example, if the "Assemble Markdown" node produces incorrect output, check its input to see if the chapter data from the loop was correctly passed.
    *   **Output Data:** Examine the data the node produced. This is especially important for the "Assemble Markdown" (Function node) to see the generated Markdown, and for the "Upload to Google Drive" node to see any error messages from Google Drive.

3.  **Examine Error Messages:**
    *   If a node is red, open it and look for an "Error" tab or section. The error message often provides clues about what went wrong (e.g., authentication issues, API errors, incorrect data formatting for a node's input).

4.  **Function Node (`Assemble Markdown`):**
    *   If the Markdown content is incorrect but the inputs to this node seem fine, there might be a logic error in the JavaScript code within the Function node. You can add `console.log()` statements inside the function code (viewable in n8n's browser console or server logs, depending on n8n setup) to debug its internal state during execution.

5.  **Google Drive Node Errors:**
    *   Common issues include:
        *   Incorrect Folder ID (as tested in Test Case 5).
        *   Authentication problems (re-authenticate the Google Drive credential in n8n).
        *   Lack of permissions for the authenticated user to write to the specified folder.
        *   Google Drive API limits (unlikely for single file uploads).

By following these steps, you should be able to identify where the workflow is failing and why.
---
