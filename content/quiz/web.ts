import { defineQuiz } from "@/lib/content/types";

export default defineQuiz([
  {
    id: "web-get-vs-post",
    topic: "web",
    prompt: "What is the conventional difference between GET and POST?",
    choices: [
      "GET is encrypted; POST is not",
      "GET sends JSON; POST sends HTML",
      "GET reads data; POST creates or submits data",
      "GET is for browsers; POST is for mobile apps",
    ],
    answer: 2,
    explain:
      "GET should be safe: it retrieves data without changing server state, and its parameters go in the URL. POST carries a body and is used to create resources or submit data.",
  },
  {
    id: "web-put-vs-patch",
    topic: "web",
    prompt: "What is the difference between PUT and PATCH?",
    choices: [
      "PUT replaces the whole resource; PATCH updates part of it",
      "PUT creates a resource; PATCH deletes one",
      "PATCH replaces the whole resource; PUT updates part of it",
      "They are identical; PATCH is just the newer name",
    ],
    answer: 0,
    explain:
      "PUT sends the complete new representation, so anything omitted is overwritten; PATCH sends only the fields to change. Updating just a user's email is a PATCH.",
  },
  {
    id: "web-idempotent-meaning",
    topic: "web",
    prompt: "What does it mean for an HTTP method to be idempotent?",
    choices: [
      "It never changes anything on the server",
      "Repeating it has the same effect as sending it once",
      "It always returns exactly the same status code and body",
      "It can only be sent over an HTTPS connection",
    ],
    answer: 1,
    explain:
      "Idempotency is about the resulting server state, which is what makes a retry after a timeout safe. 'Never changes anything' is the definition of a safe method, a stricter property.",
  },
  {
    id: "web-idempotent-which",
    topic: "web",
    prompt: "Which of these HTTP methods is NOT idempotent?",
    choices: ["GET", "PUT", "DELETE", "POST"],
    answer: 3,
    explain:
      "Sending the same POST twice typically creates two resources, such as two orders or two charges. GET, PUT and DELETE are idempotent: deleting something twice still leaves it deleted.",
  },
  {
    id: "web-status-201",
    topic: "web",
    prompt: "A POST request successfully creates a new user. Which status code is the most accurate response?",
    choices: ["200 OK", "204 No Content", "201 Created", "301 Moved Permanently"],
    answer: 2,
    explain:
      "2xx means success. 200 is the general OK, while 201 says specifically that a new resource was created, often with a Location header pointing to it.",
  },
  {
    id: "web-status-401-vs-403",
    topic: "web",
    prompt: "A logged-in user requests an admin-only endpoint they are not allowed to use. Which status code fits?",
    choices: ["403 Forbidden", "401 Unauthorized", "404 Not Found", "400 Bad Request"],
    answer: 0,
    explain:
      "401 means 'I do not know who you are' (missing or invalid credentials); 403 means 'I know who you are and you may not do this'. It is authentication versus authorization.",
  },
  {
    id: "web-status-4xx-vs-5xx",
    topic: "web",
    prompt:
      "Your API handler throws an unhandled exception while processing a perfectly valid request. Which status code should the client see?",
    choices: ["400 Bad Request", "404 Not Found", "200 OK", "500 Internal Server Error"],
    answer: 3,
    explain:
      "4xx codes mean the client did something wrong (400 bad input, 404 no such resource); 5xx codes mean the server failed. A bug in your code is the server's fault, so 500.",
  },
  {
    id: "web-status-301",
    topic: "web",
    prompt: "What does a 301 status code tell the client?",
    choices: [
      "The request was malformed",
      "The resource has moved to a new URL for good",
      "The server is temporarily too busy to handle the request",
      "The resource was created successfully",
    ],
    answer: 1,
    explain:
      "3xx codes are redirects. 301 is permanent, so browsers and search engines remember the new URL given in the Location header; 302 and 307 are temporary.",
  },
  {
    id: "web-status-400",
    topic: "web",
    prompt: "A client POSTs JSON that is missing a required field. Which status code fits best?",
    choices: ["500 Internal Server Error", "404 Not Found", "400 Bad Request", "401 Unauthorized"],
    answer: 2,
    explain:
      "400 says the request itself is invalid and the client must fix it before retrying. 404 would mean the URL does not point to anything, and 500 would wrongly blame the server.",
  },
  {
    id: "web-stateless",
    topic: "web",
    prompt: "REST APIs are described as stateless. What does that mean?",
    choices: [
      "Each request carries everything needed to handle it",
      "The server stores no data of any kind",
      "Responses are never allowed to be cached",
      "The client must not keep data between requests",
    ],
    answer: 0,
    explain:
      "The server does not remember earlier requests from a client, so every request includes its own context, such as an auth token. Any server instance can then handle any request, which makes scaling out easy.",
  },
  {
    id: "web-cors",
    topic: "web",
    prompt: "What is CORS?",
    choices: [
      "A way to compress HTTP responses",
      "A firewall that blocks requests from other countries",
      "An encryption layer between browser and server",
      "A browser rule for which origins may call your API",
    ],
    answer: 3,
    explain:
      "By default browsers stop JavaScript on one origin from reading responses from another (the same-origin policy). The API opts in by sending headers such as Access-Control-Allow-Origin. Browsers enforce it, so Postman and curl are unaffected.",
  },
  {
    id: "web-postman",
    topic: "web",
    prompt: "What is Postman used for?",
    choices: [
      "Deploying a web app's code to its production servers",
      "Sending requests to an API and viewing responses",
      "Delivering transactional email to users",
      "Capturing raw packets on a network interface",
    ],
    answer: 1,
    explain:
      "Postman is an API client: you choose a method, URL, headers and body, send the request, and see the status, headers and JSON that come back. It lets you test and document a backend without writing a frontend.",
  },
  {
    id: "web-json-valid",
    topic: "web",
    prompt: "Which of these is valid JSON?",
    choices: [
      '{name: "Ada", age: 19}',
      "{'name': 'Ada', 'age': 19}",
      '{"name": "Ada", "age": 19}',
      '{"name": "Ada", "age": 19,}',
    ],
    answer: 2,
    explain:
      "JSON is a text format for structured data: keys and strings need double quotes and trailing commas are not allowed. In Python, json.loads turns it into a dict and json.dumps goes the other way.",
  },
  {
    id: "web-cookies-vs-tokens",
    topic: "web",
    prompt: "How does cookie-based auth differ from sending a token in the Authorization header?",
    choices: [
      "Browsers attach cookies automatically; code attaches tokens",
      "Cookies are always encrypted; tokens are always plain text",
      "Tokens only work over HTTP; cookies only work over HTTPS",
      "Cookies are stored on the server; tokens are stored in the browser",
    ],
    answer: 0,
    explain:
      "The browser sends a cookie with every request to its site, which is convenient but is why CSRF protection is needed. A bearer token (often a JWT) is added by your code to each request, which suits APIs and mobile apps.",
  },
  {
    id: "web-https",
    topic: "web",
    prompt: "What does HTTPS add on top of HTTP?",
    choices: [
      "Faster responses through compression",
      "A guarantee that the site contains no malware",
      "Protection against SQL injection attacks",
      "TLS encryption and proof of the server's identity",
    ],
    answer: 3,
    explain:
      "HTTPS is HTTP inside a TLS connection: traffic is encrypted and integrity-protected in transit, and the server proves who it is with a certificate. It says nothing about whether the site itself is trustworthy.",
  },
]);
