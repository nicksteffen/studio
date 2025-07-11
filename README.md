# Before30Bucket

This is a Next.js application for creating, sharing, and finding inspiration for "30 before 30" bucket lists. It's built with Next.js, Tailwind CSS, and integrates with AI for suggestions.

## Getting Started

Follow these steps to get your local development environment running and to fully deploy the application.

### 1. Install Dependencies

First, install the necessary npm packages:

```bash
npm install
```

### 2. Set Up Supabase

This project is configured to use Supabase for its database and authentication.

1.  **Create a Supabase Project:** Go to [supabase.com](https://supabase.com), create an account, and start a new project.
2.  **Get API Credentials:** In your Supabase project dashboard, go to **Project Settings** > **API**. You will need two values:
    *   Project URL
    *   Project API Key (the `anon` `public` key)

### 3. Configure Environment Variables

Create a file named `.env.local` in the root of your project. Add the Supabase credentials you retrieved in the previous step.

```
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Google Gemini API Key (for Genkit AI features)
GOOGLE_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY
```

You can get a Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Set Up Database Schema and Sample Data

To get the app running with browseable content, you need to set up the database schema and add some sample data.

1.  **Sign Up Sample Users:** Use the Sign Up page in the app to create 2-3 sample user accounts (e.g., for "Jessica" and "Ben").
2.  **Get User IDs:** Go to your Supabase dashboard, navigate to **Authentication** > **Users**, and copy the `ID` for each user you created.
3.  **Run SQL Script:** Open the `sample-data.sql` file in the root of this project.
    *   Replace the placeholder UUIDs in the script with the actual user IDs you just copied.
    *   Go to the **SQL Editor** in your Supabase dashboard.
    *   Copy the entire contents of `sample-data.sql` and run it. This will create all necessary tables (`profiles`, `lists`, `list_items`) and populate them with data.

### 5. Run the Development Server

Now you can start the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Monetization Setup

### Google AdSense

1.  **Sign Up for AdSense:** Create an account at [Google AdSense](https://www.google.com/adsense/start/).
2.  **Get Ad Unit Code:** Once your site is approved, create new ad units and get the ad code snippets.
3.  **Replace Placeholders:** In the code, find the `<AdPlaceholder />` component (used in `/app/to-buy/page.tsx`). Replace this component with a new component that contains the script provided by AdSense. You might need to use `next/script` for optimal loading.

### Amazon Affiliate Links

1.  **Join Amazon Associates:** Sign up for the [Amazon Associates Program](https://affiliate-program.amazon.com/).
2.  **Generate Affiliate Links:** Find products you want to promote and generate your unique affiliate links through the Associates dashboard.
3.  **Update Product Data:** The affiliate products are currently mocked in `/lib/mock-data.ts`. You should replace this with a system to manage your affiliate links. For a simple setup, you can just edit the `sampleAffiliateItems` array with your real product data and affiliate URLs. For a more advanced setup, you could store this data in a Supabase table.

## Deployment

This project is set up for Firebase App Hosting.

1.  **Install Firebase CLI:** If you don't have it, install it globally: `npm install -g firebase-tools`.
2.  **Login to Firebase:** `firebase login`.
3.  **Initialize Firebase:** `firebase init apphosting`. Follow the prompts to connect to your Firebase project.
4.  **Deploy:** Run the deploy command: `firebase apphosting:backends:deploy`.

Alternatively, to deploy to Vercel, you can import your Git repository into Vercel and configure the environment variables in the project settings.
