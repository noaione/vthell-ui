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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Fnoaione%2Fvthell-ui.git&env=NEXT_PUBLIC_BACKEND_API_URL&envDescription=Important%20API%20Keys%20needed%20for%20the%20website%20to%20run%20properly&envLink=https%3A%2F%2Fgithub.com%2Fnoaione%2Fvthell-ui%2Fblob%2Fmaster%2Ffrontend%2F.env.example&project-name=vthell-ui&repository-name=vthell-ui&demo-title=VTHell%20WebUI&demo-description=A%20deployed%20VTHell%20WebUI%20sample&demo-url=https%3A%2F%2Fvthui.n4o.xyz)

1. Create an account at [Vercel](https://vercel.com/dashboard)
2. Click new Project
3. Click `Import Third-Party Git Repository`
4. Enter this URL: `https://github.com/noaione/vthell-ui.git` and the Continue
5. Create a Git Repository of yours and named it whatever you want
6. Configure the Project to this:
   - Framework Preset: `Next.JS`
   - Root Directory: `frontend`
7. In the Environment Variables, create a new Env named `NEXT_PUBLIC_BACKEND_API_URL` and enter the value to your deployed Backend API
8. Click Deploy

## Development
1. Do everything as the [Preparing](#preparing) section
2. Start the server by using `yarn run dev`

It will start the development server at port `8200`