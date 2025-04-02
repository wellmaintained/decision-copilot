## Deploying the functions

Setup the ADMIN_EMAILS environment variable
```bash
echo "admin@example.com,another-admin@example.com" | \
  firebase functions:secrets:set ADMIN_EMAILS --data-file -
```

Deploy the functions
```bash
pnpm run deploy:functions
```

