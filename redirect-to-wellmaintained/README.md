# Redirect to WellMaintained

This is a simple Firebase hosting site that redirects all requests to [decision-copilot.wellmaintained.org](https://decision-copilot.wellmaintained.org).

## Setup

1. Make sure you have the Firebase CLI installed:
   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```
   firebase login
   ```

3. Initialize the project (if not already done):
   ```
   firebase init
   ```
   - Select "Hosting" when prompted
   - Choose the appropriate Firebase project
   - Set "public" as your public directory
   - Configure as a single-page app: No

## Deployment

To deploy the site:

```
firebase deploy
```

## How it works

The site uses two methods for redirection:
1. HTML meta refresh tag in the index.html file
2. Firebase hosting redirects configuration in firebase.json

This ensures that all requests to this domain are properly redirected to decision-copilot.wellmaintained.org with a 301 (permanent) redirect. 