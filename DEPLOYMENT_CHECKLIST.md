# 🚀 Vercel Deployment Checklist

Use this checklist to ensure a smooth deployment.

## Pre-Deployment

- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Create Vercel account at https://vercel.com/signup
- [ ] Login to Vercel: `vercel login`
- [ ] Create `.env` file from template: `cp .env.example .env`
- [ ] Set secure `JWT_SECRET` in `.env` (generate random string)
- [ ] Test local build: `npm run build`
- [ ] Commit all changes to git (optional but recommended)

## Deployment

- [ ] Run deployment setup: `./deploy-setup.sh` (or check manually)
- [ ] Deploy to Vercel: `vercel`
- [ ] Follow CLI prompts:
  - [ ] Link to existing project or create new
  - [ ] Set project name
  - [ ] Confirm settings
- [ ] Wait for build to complete
- [ ] Note the deployment URL

## Post-Deployment

- [ ] Visit the deployment URL
- [ ] Test login with admin credentials
- [ ] Change admin password immediately
- [ ] Create a team manager user for testing
- [ ] Test creating teams, players, matches
- [ ] Test match result recording
- [ ] Verify statistics page works

## Environment Variables (Vercel Dashboard)

- [ ] Go to project settings in Vercel
- [ ] Add environment variables:
  - [ ] `JWT_SECRET` (same as your .env)
  - [ ] `ADMIN_USERNAME` (default: admin)
  - [ ] `ADMIN_PASSWORD` (change after first login)
- [ ] Apply to all environments (Production, Preview, Development)
- [ ] Redeploy if needed

## Production Deployment

- [ ] Deploy to production: `vercel --prod`
- [ ] Test production URL
- [ ] Set up custom domain (optional, see Vercel docs)
- [ ] Consider setting up a database (see DEPLOYMENT.md)

## ⚠️ Important Notes

**Data Persistence**: 
- Current setup uses JSON file storage
- Data will reset between deployments
- For persistent data, set up Vercel Postgres or MongoDB Atlas
- See DEPLOYMENT.md for database setup instructions

**Free Tier Limits**:
- 100GB bandwidth/month
- Serverless function execution limits
- Check Vercel dashboard for usage

## 🆘 Troubleshooting

If something goes wrong:

1. **Build fails**: 
   - Check build logs in Vercel dashboard
   - Try `npm run build` locally
   - Verify all dependencies are in package.json

2. **API not working**:
   - Check function logs in Vercel
   - Verify environment variables are set
   - Check vercel.json configuration

3. **Can't login**:
   - Verify JWT_SECRET is set
   - Check that admin user is created
   - Check browser console for errors

4. **Data disappears**:
   - Expected with JSON storage on Vercel
   - Set up a proper database (see DEPLOYMENT.md)

## ✅ Deployment Complete!

Once all items are checked:
- Your app is live! 🎉
- Share the URL with your league
- Monitor usage in Vercel dashboard
- Back up your data regularly (if using JSON)

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
