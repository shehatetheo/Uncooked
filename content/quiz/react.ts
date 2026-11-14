import { defineQuiz } from "@/lib/content/types";

export default defineQuiz([
  {
    id: "react-props-vs-state",
    topic: "react",
    prompt: "What is the difference between props and state in React?",
    choices: [
      "Props are for class components; state is for function components",
      "Props are passed in by the parent; state is owned by the component",
      "State is read-only; props can be changed by the child",
      "Props live in the browser; state lives on the server",
    ],
    answer: 1,
    explain:
      "Props are inputs a component receives and must not modify. State is data the component manages itself and updates with a setter, which triggers a re-render.",
  },
  {
    id: "react-child-updates-parent",
    topic: "react",
    prompt: "A child component needs to change a value that lives in its parent's state. What is the React way?",
    choices: [
      "Assign to props.value inside the child",
      "Copy the prop into a global variable",
      "Use document.querySelector to edit the parent's DOM directly",
      "The parent passes down a callback that calls its setter",
    ],
    answer: 3,
    explain:
      "Props are read-only, so the parent keeps ownership of the state and hands the child a function such as onChange. This is 'data down, events up', also called lifting state up.",
  },
  {
    id: "react-state-setter",
    topic: "react",
    prompt:
      "const [count, setCount] = useState(0);\nWhy call setCount(count + 1) instead of writing count = count + 1?",
    choices: [
      "The setter tells React to re-render",
      "Assigning directly works but is slower",
      "The count variable is stored on the server",
      "The setter also saves the value to localStorage",
    ],
    answer: 0,
    explain:
      "React only knows state changed when you call the setter; it then schedules a re-render and the component function runs again with the new value. A direct assignment is invisible to React, and count is a const anyway.",
  },
  {
    id: "react-useeffect-purpose",
    topic: "react",
    prompt: "What is useEffect for?",
    choices: [
      "Declaring the state variables that a component will use",
      "Making a component render faster",
      "Running side effects, like a fetch, after render",
      "Passing data from a parent to a child",
    ],
    answer: 2,
    explain:
      "Rendering should be pure, so useEffect is where you synchronize with things outside React: network requests, timers, subscriptions, the document title. It runs after the component has rendered.",
  },
  {
    id: "react-useeffect-empty-deps",
    topic: "react",
    prompt: "useEffect(() => { loadData(); }, []);\nWhen does this effect run?",
    choices: [
      "Once, after the first render",
      "After every single render",
      "Only when the component unmounts",
      "Never, because the array is empty",
    ],
    answer: 0,
    explain:
      "React re-runs an effect only when a value in its dependency array changes. An empty array has nothing that can change, so the effect runs once per mount (development Strict Mode deliberately runs it twice to expose bugs).",
  },
  {
    id: "react-useeffect-deps-change",
    topic: "react",
    prompt: "useEffect(() => { fetchUser(id); }, [id]);\nWhen does the effect run?",
    choices: [
      "After every render, whatever changed",
      "Only once, when the component mounts",
      "Every time any state in the app changes",
      "After mount, and again whenever id changes",
    ],
    answer: 3,
    explain:
      "React compares each dependency with its value from the previous render and re-runs the effect if any differ. Leaving out a value the effect uses causes stale data; omitting the array entirely runs the effect after every render.",
  },
  {
    id: "react-useeffect-cleanup",
    topic: "react",
    prompt: "An effect starts a setInterval. Where should the matching clearInterval go?",
    choices: [
      "In a second useEffect with no dependencies",
      "In the function returned from the effect",
      "Directly in the component body",
      "Nowhere; React clears timers automatically",
    ],
    answer: 1,
    explain:
      "The function an effect returns is its cleanup. React calls it before re-running the effect and when the component unmounts; without it, timers and subscriptions leak.",
  },
  {
    id: "react-list-keys",
    topic: "react",
    prompt: "Why does React want a key on each element when you render a list with map?",
    choices: [
      "Keys are used as CSS selectors",
      "Keys sort the list alphabetically",
      "Keys let React match items between renders",
      "Keys stop the list from re-rendering at all",
    ],
    answer: 2,
    explain:
      "A stable, unique key such as a database id tells React which item is which when the list is reordered, inserted into or filtered, so it updates the right DOM nodes and keeps their state. Array indexes are a poor key when the order can change.",
  },
  {
    id: "react-ssr-vs-csr",
    topic: "react",
    prompt: "What is the difference between server-side rendering (SSR) and client-side rendering (CSR)?",
    choices: [
      "SSR needs no JavaScript at all; CSR needs no HTML at all",
      "SSR runs in the browser; CSR runs on the server",
      "SSR is for mobile apps; CSR is for desktop sites",
      "SSR sends ready HTML; CSR builds it in the browser",
    ],
    answer: 3,
    explain:
      "With SSR the server renders HTML for each request, so users and search engines see content immediately and JavaScript then hydrates it. With CSR the browser downloads a mostly empty page plus JavaScript and renders there.",
  },
  {
    id: "react-ssg",
    topic: "react",
    prompt: "What is static site generation (SSG)?",
    choices: [
      "HTML is rendered in the browser from a JSON payload",
      "HTML is rendered once at build time and reused",
      "HTML is rendered on the server for each request",
      "The site ships with no JavaScript whatsoever",
    ],
    answer: 1,
    explain:
      "Pages are pre-rendered during the build and served as static files, typically from a CDN. It is the fastest and cheapest option for content that is the same for every visitor, such as docs and marketing pages.",
  },
  {
    id: "react-next-route-handler",
    topic: "react",
    prompt: "In the Next.js App Router, what does a file app/api/hello/route.ts that exports a GET function do?",
    choices: [
      "Handles GET requests to /api/hello on the server",
      "Renders a page at /api/hello in the browser",
      "Defines a React component named GET",
      "Adds a GET button to the page at /hello",
    ],
    answer: 0,
    explain:
      "Route handlers (called API routes in the older Pages Router) are server-side HTTP endpoints that live inside the Next.js project. They are where code that needs secrets belongs, such as calling a paid API with a key.",
  },
  {
    id: "react-next-server-components-default",
    topic: "react",
    prompt: "In the Next.js App Router, a component file has no directive at the top. Where does it render?",
    choices: [
      "Only in the browser",
      "In a web worker",
      "On the server, as a Server Component",
      'Nowhere until you add a "use server" directive',
    ],
    answer: 2,
    explain:
      'App Router components are Server Components by default: they render on the server, can read databases and secrets directly, and send no component JavaScript to the browser. You opt into the client with "use client".',
  },
  {
    id: "react-next-use-client",
    topic: "react",
    prompt: 'Which of these forces you to mark a component with "use client"?',
    choices: [
      "Fetching data with await",
      "Calling useState or attaching onClick",
      "Reading a server environment variable",
      "Rendering a list with map",
    ],
    answer: 1,
    explain:
      "State, effects, event handlers and browser APIs such as window or localStorage only exist in the browser, so components that use them must be Client Components. Keep those small and leave the rest on the server.",
  },
  {
    id: "react-controlled-input",
    topic: "react",
    prompt: "What makes an <input> a controlled component in React?",
    choices: [
      "It has the disabled attribute set",
      "It is read through a ref when the form is submitted",
      "Its value comes from state, updated in onChange",
      "The browser validates it before React sees the value",
    ],
    answer: 2,
    explain:
      "In a controlled input, React state is the single source of truth: value={name} plus onChange={(e) => setName(e.target.value)}. That makes validation and resetting easy; reading through a ref is the uncontrolled approach.",
  },
]);
