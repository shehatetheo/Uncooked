import { defineQuiz } from "@/lib/content/types";

export default defineQuiz([
  {
    id: "js-loose-vs-strict-equality",
    topic: "js-ts",
    prompt: 'In JavaScript, what are 0 == "0" and 0 === "0"?',
    choices: ["true and true", "true and false", "false and true", "false and false"],
    answer: 1,
    explain:
      "== converts the operands to a common type before comparing, so the string becomes the number 0. === compares type and value with no coercion, which is why it is the default choice.",
  },
  {
    id: "js-var-let-const-scope",
    topic: "js-ts",
    prompt: "How does var differ from let and const?",
    choices: [
      "var cannot be reassigned",
      "var only exists in TypeScript",
      "var is block-scoped; let and const are function-scoped",
      "var is function-scoped; let and const are block-scoped",
    ],
    answer: 3,
    explain:
      "A var declared inside an if or for block is visible in the whole function and is hoisted as undefined. let and const stay inside the nearest braces, which prevents a whole class of bugs.",
  },
  {
    id: "js-const-mutation",
    topic: "js-ts",
    prompt: "const nums = [1, 2];\nnums.push(3);\nWhat happens?",
    choices: [
      "nums becomes [1, 2, 3]",
      "TypeError: assignment to constant variable",
      "The push is silently ignored",
      "A new array is created and nums still holds [1, 2]",
    ],
    answer: 0,
    explain:
      "const prevents reassigning the variable, not mutating the object it refers to. nums = [4] would throw, but nums.push(3) is fine.",
  },
  {
    id: "js-promise-what",
    topic: "js-ts",
    prompt: "What is a Promise in JavaScript?",
    choices: [
      "A function that always runs on a separate thread",
      "A guarantee that a function never throws",
      "An object representing a future result or failure",
      "A variable that cannot be reassigned",
    ],
    answer: 2,
    explain:
      "A promise stands for the eventual result of an asynchronous operation and is pending, fulfilled or rejected. You consume it with .then and .catch, or with await.",
  },
  {
    id: "js-async-await",
    topic: "js-ts",
    prompt: "Inside an async function, what does await fetch(url) do?",
    choices: [
      "Blocks the whole browser tab until the response arrives",
      "Pauses only this function until the promise settles",
      "Runs fetch on a background thread and returns at once",
      "Converts the response body to JSON",
    ],
    answer: 1,
    explain:
      "await suspends just the async function and hands control back to the event loop, so the page stays responsive. Execution resumes when the promise fulfills, or throws if it rejects.",
  },
  {
    id: "js-async-returns-promise",
    topic: "js-ts",
    prompt: "What does an async function always return?",
    choices: ["undefined", "The raw value after its return statement", "A callback function", "A Promise"],
    answer: 3,
    explain:
      "Even async function f() { return 1 } returns a Promise that resolves to 1, so callers must await it or use .then. Forgetting the await is a very common bug.",
  },
  {
    id: "js-event-loop-order",
    topic: "js-ts",
    prompt:
      'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nconsole.log("C");\nIn what order are the letters printed?',
    choices: ["A B C", "B A C", "A C B", "C A B"],
    answer: 2,
    explain:
      "setTimeout only queues its callback. The event loop runs queued callbacks after the current synchronous code has finished and the call stack is empty, so even a 0 ms timer runs after C.",
  },
  {
    id: "js-event-loop-what",
    topic: "js-ts",
    prompt: "JavaScript runs your code on a single thread. What does the event loop do?",
    choices: [
      "Runs queued callbacks once the call stack is empty",
      "Splits long functions across several CPU cores",
      "Re-runs the whole script every few milliseconds",
      "Compiles TypeScript to JavaScript as the page runs",
    ],
    answer: 0,
    explain:
      "Slow work such as network calls and timers is handled outside the JavaScript thread by the browser or Node; when it finishes, a callback is queued. The event loop keeps taking the next callback once the current code is done.",
  },
  {
    id: "js-ts-why-typescript",
    topic: "js-ts",
    prompt: "Why use TypeScript instead of plain JavaScript?",
    choices: [
      "It runs faster in the browser",
      "Browsers execute it natively, so no build step is needed",
      "Static types catch many errors before the code runs",
      "It removes the need to write tests",
    ],
    answer: 2,
    explain:
      "TypeScript adds a compile-time type checker on top of JavaScript, giving earlier error detection, better autocomplete and safer refactoring. It compiles to ordinary JavaScript, so there is no runtime speed gain.",
  },
  {
    id: "js-ts-types-erased",
    topic: "js-ts",
    prompt:
      "A TypeScript function expects { name: string }. At runtime an API responds with { name: 42 }. What happens?",
    choices: [
      "TypeScript throws a type error at runtime",
      "Nothing stops it; types are erased when compiled",
      'TypeScript converts 42 to the string "42"',
      "The fetch call rejects the response",
    ],
    answer: 1,
    explain:
      "Types exist only at compile time; the emitted JavaScript contains no checks. Data from outside (APIs, forms, storage) needs runtime validation, for example with a zod schema.",
  },
  {
    id: "js-ts-strict-mode",
    topic: "js-ts",
    prompt: 'What does "strict": true in tsconfig.json do?',
    choices: [
      "Makes the compiled JavaScript run faster",
      "Forbids importing plain JavaScript libraries",
      "Turns every ESLint warning into a compile error",
      "Turns on a family of stricter type checks",
    ],
    answer: 3,
    explain:
      "strict enables a group of checks including noImplicitAny and strictNullChecks, so null and undefined must be handled explicitly and untyped values are flagged. It is separate from JavaScript's own \"use strict\" runtime mode.",
  },
  {
    id: "js-undefined-vs-null",
    topic: "js-ts",
    prompt: "What is the usual distinction between undefined and null in JavaScript?",
    choices: [
      "undefined: not assigned yet. null: deliberately empty",
      "null is for numbers; undefined is for objects",
      "They behave identically in every comparison",
      "undefined is always an error state; null is a valid value",
    ],
    answer: 0,
    explain:
      "An unassigned variable, a missing property and a missing argument are all undefined; null is what a programmer assigns to say 'intentionally nothing'. null == undefined is true, but null === undefined is false.",
  },
  {
    id: "js-ts-type-vs-interface",
    topic: "js-ts",
    prompt: "Which of these can a TypeScript type alias do that an interface cannot?",
    choices: [
      "Describe the shape of an object",
      "Be extended by another declaration",
      'Name a union such as "on" | "off"',
      "Be exported from a module",
    ],
    answer: 2,
    explain:
      "Both can describe object shapes. A type alias can also name unions, primitives and tuples, while an interface can be reopened and merged across declarations. A common rule is interface for object contracts and type for unions.",
  },
  {
    id: "js-use-strict",
    topic: "js-ts",
    prompt: 'What does putting "use strict" at the top of a JavaScript file do?',
    choices: [
      "Turns some silent mistakes into thrown errors",
      "Enables TypeScript type checking for the file",
      "Makes every variable in the file constant",
      "Makes == behave exactly like ===",
    ],
    answer: 0,
    explain:
      "Strict mode makes JavaScript less forgiving: assigning to an undeclared variable throws a ReferenceError instead of quietly creating a global. ES modules and class bodies are always in strict mode.",
  },
]);
