# Olster Studios Admin setup

The public website remains on GitHub Pages. The admin interface is `/admin/`; its private API runs as Vercel serverless functions in this repository. No repository token or OAuth secret belongs in browser code.

## 1. Deploy the API
1. Import `lmslickolster/lmslickolster.github.io` into Vercel and deploy from `main`. Keep the existing GitHub Pages publishing setup unchanged.
2. In Vercel project settings, add these **Environment Variables** for Production:
   - `GITHUB_CLIENT_ID`: GitHub OAuth App client ID.
   - `GITHUB_CLIENT_SECRET`: OAuth App client secret.
   - `GITHUB_CALLBACK_URL`: exact URL `https://YOUR-VERCEL-DOMAIN/api/auth/callback`.
   - `ADMIN_GITHUB_USERNAME`: the one GitHub username allowed to administer this site.
   - `SESSION_SECRET`: a long random secret (at least 32 random bytes).
   - `GH_REPO_TOKEN`: fine-grained GitHub token restricted to `lmslickolster/lmslickolster.github.io`, with **Contents: Read and write** only.
   - `SITE_URL`: `https://olsterstudios.site`.
3. Redeploy after setting environment variables.

## 2. Configure GitHub OAuth
Create a GitHub OAuth App in GitHub Settings → Developer settings → OAuth Apps.
- Homepage URL: `https://olsterstudios.site`
- Authorization callback URL: the exact `GITHUB_CALLBACK_URL` above.
- The OAuth app is used to verify the administrator's GitHub identity. The separate fine-grained token is what writes website commits; it is stored only as a Vercel server environment variable.

## 3. Connect the public admin page to the API
Edit `admin/config.js` and set `apiBase` to your deployed Vercel URL plus `/api`, for example `https://YOUR-VERCEL-DOMAIN/api`. This URL is public, but it contains no secret. Commit that change to `main`. Wait for GitHub Pages to publish, then visit `https://olsterstudios.site/admin/`.

## 4. Use it
- Sign in with the GitHub username configured in `ADMIN_GITHUB_USERNAME`.
- Edit and save the homepage source or blog source.
- Hidden draft articles are listed from the disabled blog block. Use **Publish draft** to make a draft visible and commit the change.
- Saves create commits on `main`; GitHub Pages may take several minutes to update.

## Security notes
- Never add `GH_REPO_TOKEN`, `GITHUB_CLIENT_SECRET`, or `SESSION_SECRET` to `admin/config.js` or any public HTML/JS file.
- Keep the fine-grained token limited to this repository and Contents permission.
- The API checks the signed-in GitHub username on every edit and encrypts its session cookie. Only the configured username is accepted.
- GitHub Pages source is public. HTML comments hide drafts from the rendered page, **not** from people who inspect the repository source. Do not put private information in draft text.
- If a secret is accidentally committed, revoke/rotate it immediately.
- If you change the website domain, update the allowed origins in `api/_lib.js` and redeploy.
