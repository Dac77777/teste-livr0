# Setting Up Google Drive API Access for n8n

This guide will walk you through the process of creating Google Cloud credentials to allow n8n to interact with your Google Drive files.

## Prerequisites

*   A Google Account.
*   Access to an n8n instance.

## Steps

### Part 1: Google Cloud Console Configuration

1.  **Create a New Google Cloud Project**
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   In the top menu bar, click on the project selector (it might show the name of an existing project).
    *   In the "Select a project" dialog, click **NEW PROJECT**.
    *   Enter a **Project name** (e.g., "n8n Google Drive Integration") and select a **Billing account** if prompted.
    *   Choose an **Organization** and **Location** if applicable.
    *   Click **CREATE**.

2.  **Enable the Google Drive API**
    *   Once your project is created, ensure it's selected in the project selector at the top.
    *   In the navigation menu (hamburger icon ☰ on the left), go to **APIs & Services > Library**.
    *   In the search bar, type "Google Drive API" and select it from the results.
    *   Click the **Enable** button. If it's already enabled, you'll see a "Manage" button.

3.  **Configure the OAuth Consent Screen**
    *   Before creating credentials, you might need to configure the OAuth consent screen.
    *   In the navigation menu, go to **APIs & Services > OAuth consent screen**.
    *   Choose the **User Type**:
        *   **Internal**: If you're using Google Workspace and n8n will only be used by users within your organization.
        *   **External**: If you plan to allow any Google user or are using a personal Google account.
    *   Click **CREATE**.
    *   Fill in the required information:
        *   **App name**: Something descriptive, e.g., "n8n Workflow Automation".
        *   **User support email**: Your email address.
        *   **App logo**: Optional.
    *   Scroll down to **Developer contact information** and enter your email address.
    *   Click **SAVE AND CONTINUE**.
    *   On the **Scopes** page, you don't need to add scopes here manually; n8n will request them. Click **SAVE AND CONTINUE**.
    *   On the **Test users** page (for External apps):
        *   If your app is in "testing" mode, you must add the Google accounts that will be used to authenticate with n8n as test users. Click **+ ADD USERS** and enter their email addresses.
        *   If you later publish the app, this restriction is removed. For personal use, keeping it in testing mode and adding your email is fine.
    *   Click **SAVE AND CONTINUE**.
    *   Review the summary and click **BACK TO DASHBOARD**.

4.  **Create OAuth 2.0 Client ID Credentials**
    *   In the navigation menu, go to **APIs & Services > Credentials**.
    *   Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
    *   For **Application type**, select **Web application**.
    *   Give your OAuth client ID a **Name** (e.g., "n8n Google Drive Web Client").
    *   Under **Authorized redirect URIs**:
        *   This is a crucial step. You will get the correct URI from n8n itself.
        *   For now, you can leave this blank or add a temporary placeholder like `http://localhost`. You **must** update this later with the URI provided by n8n.
    *   Click **CREATE**.
    *   A dialog will appear showing your **Your Client ID** and **Your Client Secret**. **Copy both of these values immediately and store them securely.** You will need them to configure n8n.

### Part 2: Configuring n8n Google Drive Node

1.  **Add a Google Drive Node to Your Workflow**
    *   In your n8n workflow, add a Google Drive node (or any other Google node like Google Sheets, Gmail that uses similar authentication).

2.  **Create New Credentials in n8n**
    *   Open the Google Drive node's properties.
    *   Next to the **Credential** field, click the dropdown and select "Create New".
    *   A dialog will appear for setting up the Google API credentials.
    *   Enter your **Client ID** (copied from Google Cloud in Part 1, Step 4).
    *   Enter your **Client Secret** (copied from Google Cloud in Part 1, Step 4).
    *   **Crucially, n8n will now display an "OAuth Redirect URI" or "Redirect URL"**. It will look something like `https://your-n8n-instance.com/rest/oauth2-credential/callback` or `http://localhost:5678/rest/oauth2-credential/callback` if you're running n8n locally.
    *   **Copy this exact URI provided by n8n.**

3.  **Update Authorized Redirect URIs in Google Cloud**
    *   Go back to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Navigate to **APIs & Services > Credentials**.
    *   Click the name of the OAuth 2.0 Client ID you created in Part 1, Step 4 (e.g., "n8n Google Drive Web Client") to edit its settings.
    *   Under **Authorized redirect URIs**, click **+ ADD URI**.
    *   **Paste the exact URI you copied from n8n** into the field.
    *   Click **SAVE** at the bottom of the Google Cloud page.

4.  **Complete Credential Setup in n8n**
    *   Return to the n8n credential dialog.
    *   Click the **Sign in with Google** button (or similar, the exact wording might vary).
    *   A Google authentication window will pop up. Choose the Google account you want n8n to access (ensure this account was added as a test user in Part 1, Step 3 if your app is in testing mode).
    *   Grant the requested permissions for Google Drive (and any other scopes n8n asks for).
    *   If successful, the popup window will close, and n8n will indicate that the credential has been connected.
    *   Give your credential a name in n8n (e.g., "My Google Drive Access") and click **Save** (or Create/Connect).

## Conclusion

Your n8n Google Drive node should now be successfully authenticated and ready to use. Remember to keep your Client Secret confidential. If you encounter issues, double-check that the Redirect URI in Google Cloud exactly matches the one provided by n8n.
