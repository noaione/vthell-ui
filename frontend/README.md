# VTHell WebUI (Frontend/Website)

The frontend or the website portion of the VTHell WebUI

## Preparing
1. Make sure you already have VTHell setup
2. Make sure your backend already deployed.
3. Copy the `.env.example` to `.env`
4. Modify the `NEXT_PUBLIC_BACKEND_API_URL` to your deployed Backend
5. Install dependencies by using `yarn install`
6. Start the server by using `yarn run start`

It will start the server at port `3000`

## Deploying

You can deploy this project to Vercel

1. Create an account at [Vercel](https://vercel.com/dashboard)
2. Click new Project
3. Click `Import Third-Party Git Repository`
4. Enter this URL: `https://github.com/noaione/vthell-ui.git`
5. [...]

## Development
1. Do everything as the [Preparing](#preparing) section
2. Start the server by using `yarn run dev`

It will start the development server at port `8200`