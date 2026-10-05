# Apply HTTP chat response changes

Based on Madhuunni/chatgptui221 main commit 72c53d8c0c0967ecb403dba0f8044ff0a395e7fa.

This archive contains only added/changed files and a patch. To retain local customizations, review and apply the patch from your repository root:

```sh
git switch -c feature/http-chat-response-types
git apply --check /path/to/changes.patch
git apply /path/to/changes.patch
npm test
npm run build
```

Alternatively copy the supplied files into the matching paths; do not then apply the patch as well. No dependency changes are required. Read docs/chat-api.md for the four response schemas and backend setup. The API defaults to /api/chat, with a development proxy to localhost:8000. Backend implementation and report generation are supplied by your server.

Validation: production Angular build and 11 tests passed. HTTP tests mock the server; no live backend URL was supplied. GitHub publication was blocked by integration permission error 403, so there is no remote branch or pull request.
