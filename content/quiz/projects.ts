import { defineQuiz } from "@/lib/content/types";

export default defineQuiz([
  {
    id: "proj-pwa",
    topic: "projects",
    prompt: "What is a Progressive Web App (PWA)?",
    choices: [
      "A native app written in Swift or Kotlin",
      "A website that only works in Chrome",
      "A web app that can be installed and work offline",
      "A web app that is rendered entirely on the server side",
    ],
    answer: 2,
    explain:
      "A PWA is a normal website plus a web app manifest (name and icons, so it can be installed to the home screen) and a service worker (so it can cache assets and work offline). No app store is required.",
  },
  {
    id: "proj-service-worker",
    topic: "projects",
    prompt: "What does a service worker do in a PWA?",
    choices: [
      "Intercepts network requests and can serve from cache",
      "Renders React components on the server",
      "Stores user passwords in encrypted form",
      "Speeds up the page by running its JavaScript on the GPU",
    ],
    answer: 0,
    explain:
      "A service worker is a script the browser runs in the background, separate from the page. It sits between the app and the network, so it can cache files and respond when offline, and it requires HTTPS (or localhost).",
  },
  {
    id: "proj-indexeddb-vs-localstorage",
    topic: "projects",
    prompt: "Why choose IndexedDB over localStorage for an offline-capable app?",
    choices: [
      "localStorage is wiped every time the browser tab closes",
      "IndexedDB syncs to the cloud automatically",
      "localStorage is unavailable on mobile browsers",
      "IndexedDB is async and holds large structured data",
    ],
    answer: 3,
    explain:
      "localStorage is a small (around 5 MB), synchronous, string-only key-value store that blocks the main thread. IndexedDB is an asynchronous in-browser database that stores objects and blobs, supports indexes and transactions, and works inside service workers.",
  },
  {
    id: "proj-html5-canvas",
    topic: "projects",
    prompt: "What is the HTML5 <canvas> element?",
    choices: [
      "A layout container, like a div with a grid",
      "A bitmap surface you draw on with JavaScript",
      "A vector image format, similar to SVG",
      "A tag for embedding video files",
    ],
    answer: 1,
    explain:
      'You get a drawing context with canvas.getContext("2d") and issue commands like fillRect or drawImage; the result is pixels, not DOM elements. That suits games, charts and image editing, but you handle redrawing and hit detection yourself.',
  },
  {
    id: "proj-stripe-webhook",
    topic: "projects",
    prompt: "Why does a Stripe integration use webhooks?",
    choices: [
      "To render the payment form in the browser",
      "To store card numbers safely in your own database",
      "So Stripe can tell your server a payment succeeded",
      "To make the checkout page load more quickly",
    ],
    answer: 2,
    explain:
      "A webhook is an HTTP POST that Stripe sends to your endpoint for events such as checkout.session.completed. It is the reliable signal for fulfilling an order, because the user might close the tab before being redirected back to your site.",
  },
  {
    id: "proj-stripe-webhook-signature",
    topic: "projects",
    prompt: "Your Stripe webhook endpoint is a public URL. How do you know a request really came from Stripe?",
    choices: [
      "Verify its signature with your webhook secret",
      "Check that the request body is valid JSON",
      "Trust it when the amount matches the order",
      "Check that the request uses the POST method",
    ],
    answer: 0,
    explain:
      "Stripe signs each event and sends the signature in the Stripe-Signature header; your server recomputes it over the raw request body using the endpoint's signing secret. Without that check, anyone could POST a fake 'payment succeeded' event.",
  },
  {
    id: "proj-firebase-auth",
    topic: "projects",
    prompt: "What does Firebase Authentication provide?",
    choices: [
      "A SQL database for user profiles",
      "Hosting for static websites",
      "End-to-end encryption for messages between users",
      "Managed sign-in with email or Google accounts",
    ],
    answer: 3,
    explain:
      "Firebase Auth handles account creation, sign-in, password resets and OAuth providers, so you never store passwords yourself. After sign-in the client holds an ID token (a JWT) that your backend can verify to know who is calling.",
  },
  {
    id: "proj-gemini-key-server-proxy",
    topic: "projects",
    prompt: "A Next.js app calls the Gemini API. Where should the API key live?",
    choices: [
      "In the React code, since the bundle is minified",
      "In a server environment variable, read by a server route",
      "In localStorage, so that it never appears in the source code",
      "In a NEXT_PUBLIC_ environment variable",
    ],
    answer: 1,
    explain:
      "Anything shipped to the browser can be read through dev tools, minified or not, and NEXT_PUBLIC_ variables are inlined into the client bundle. So the browser calls your own route handler, and that server code adds the key and calls Gemini, where you can also add auth and rate limits.",
  },
  {
    id: "proj-flask",
    topic: "projects",
    prompt: "What is Flask?",
    choices: [
      "A Python library for numerical arrays",
      "A JavaScript frontend framework",
      "A lightweight Python web framework",
      "A relational database engine",
    ],
    answer: 2,
    explain:
      'Flask maps URLs to Python functions with decorators like @app.route("/predict") and leaves choices such as the database and auth to you, which is why it is called a microframework. It is a common way to put a small API in front of a Python model.',
  },
  {
    id: "proj-tensorflow",
    topic: "projects",
    prompt: "In one line, what is TensorFlow?",
    choices: [
      "An open-source library for training ML models",
      "A database optimized for storing image files",
      "A tool for hand-labeling machine learning training data",
      "A cloud service that hosts Jupyter notebooks",
    ],
    answer: 0,
    explain:
      "TensorFlow, from Google, runs computations on tensors (multi-dimensional arrays) and handles automatic differentiation and GPU acceleration. Its Keras API is the usual way to define and train neural networks.",
  },
  {
    id: "proj-tailwind",
    topic: "projects",
    prompt: "What is distinctive about Tailwind CSS?",
    choices: [
      "It is a library of prebuilt, pre-styled React components",
      "It replaces HTML with a new markup language",
      "It only works inside Next.js projects",
      "You style with small utility classes in the markup",
    ],
    answer: 3,
    explain:
      "Tailwind is utility-first: classes like flex, p-4 and text-sm each do one thing, and you compose them directly on elements instead of writing separate CSS files. The build keeps only the classes you actually use, so the CSS stays small.",
  },
  {
    id: "proj-react-native-expo",
    topic: "projects",
    prompt: "What is the relationship between React Native and Expo?",
    choices: [
      "Expo is a competitor that uses Vue instead of React",
      "Expo is a framework and toolchain built on React Native",
      "React Native targets the web; Expo targets mobile",
      "Expo wraps an existing website in a mobile web view",
    ],
    answer: 1,
    explain:
      "React Native lets you write iOS and Android apps in React that render real native UI components, not a web view. Expo adds tooling on top: project setup, an app for running on your phone during development, device APIs and cloud builds.",
  },
  {
    id: "proj-jest-vs-playwright",
    topic: "projects",
    prompt: "How do Jest and Playwright differ?",
    choices: [
      "Jest is for Python code; Playwright is for JavaScript",
      "Jest tests the database; Playwright tests the API layer",
      "Jest runs unit tests; Playwright drives a real browser",
      "They do the same job; Playwright is simply newer",
    ],
    answer: 2,
    explain:
      "Jest runs fast, isolated tests of functions and components in Node. Playwright launches real browsers and clicks through the app like a user, catching integration problems at the cost of slower tests. Many unit tests plus a few end-to-end tests is the usual mix.",
  },
  {
    id: "proj-schema-validation",
    topic: "projects",
    prompt: "Why validate data from an API or a form with a schema library such as zod, even in a TypeScript project?",
    choices: [
      "TypeScript types do not exist at runtime",
      "Schemas make network requests faster",
      "TypeScript cannot describe nested objects",
      "It removes the need for a database",
    ],
    answer: 0,
    explain:
      "The compiler only checks code you wrote; data arriving from outside can have any shape. A schema checks it at runtime at the boundary and rejects bad input, and with zod you can derive the TypeScript type from the same schema.",
  },
  {
    id: "proj-vercel-deployments",
    topic: "projects",
    prompt: "What happens on Vercel when you push a commit to a pull request branch of a connected repository?",
    choices: [
      "Nothing until you upload a build by hand",
      "It replaces the production site immediately",
      "It emails the diff to everyone on the team",
      "It builds a preview deployment with its own URL",
    ],
    answer: 3,
    explain:
      "Vercel builds every push: commits to the production branch (usually main) update the live site, and other branches get a unique preview URL for review. Environment variables and secrets are configured per environment in the project settings.",
  },
]);
