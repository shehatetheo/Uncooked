import { defineCards } from "@/lib/content/types";

/**
 * SAP 101. Every card is marked `verify` because product names, dates and
 * program details change. keyPoints are deliberately high-level. Check
 * sap.com and recent SAP news before quoting anything specific.
 */

const ERP = "ERP / S/4HANA";
const BTP = "BTP";
const BDC = "Business Data Cloud";
const JOULE = "Joule";
const BASICS = "SAP basics";
const STAR = "STAR program";

export default defineCards([
  /* ───────────────────────── SAP basics ───────────────────────── */
  {
    id: "sap-basics-what",
    track: "sap",
    group: BASICS,
    kind: "concept",
    verify: true,
    question: "What does SAP do, in one sentence, and where did it come from?",
    keyPoints: [
      "SAP makes the software that organizations use to run their core operations: finance, supply chain, procurement, HR, sales",
      "Founded in 1972 in Germany by five former IBM employees; headquartered in Walldorf",
      "Its North American headquarters is in Newtown Square, Pennsylvania",
      "It is one of the largest enterprise software companies in the world",
      "Its business has been shifting from software installed on the customer's own servers to cloud subscriptions",
    ],
  },
  {
    id: "sap-basics-customers",
    track: "sap",
    group: BASICS,
    kind: "concept",
    verify: true,
    question: "Who are SAP's customers?",
    keyPoints: [
      "Businesses and public-sector organizations, not consumers",
      "From midsize companies to many of the world's largest enterprises, across almost every industry: manufacturing, retail, healthcare and life sciences, energy, banking, government",
      "The users are people like accountants, supply chain planners, buyers, HR teams and IT departments",
      "Customers usually implement SAP with help from partners and consulting firms",
      "SAP publishes headline figures on how much of the world's commerce touches an SAP system. Look up the current figure before quoting one",
    ],
  },
  {
    id: "sap-basics-portfolio",
    track: "sap",
    group: BASICS,
    kind: "concept",
    verify: true,
    question: "Besides its ERP, name a few other SAP product lines and what each is for.",
    keyPoints: [
      "SAP SuccessFactors: HR and talent management",
      "SAP Ariba: procurement and a supplier network",
      "SAP Concur: travel and expense management",
      "SAP Customer Experience: sales, service and commerce",
      "SAP Analytics Cloud and SAP Datasphere: analytics and data",
      "You do not need all of them. Know two well enough to say what problem they solve",
    ],
  },
  {
    id: "sap-basics-security",
    track: "sap",
    group: BASICS,
    kind: "concept",
    verify: true,
    question: "Why does security matter so much for a company like SAP?",
    keyPoints: [
      "SAP systems hold a company's financial records, employee data and supplier data",
      "Access is controlled through roles and authorizations, so each user sees and does only what the job requires",
      "In the cloud, the vendor shares responsibility for patching, availability and compliance",
      "An outage or breach in an ERP system can stop a business from shipping, paying or closing its books",
      "Your angle: this is where a cybersecurity focus meets enterprise software",
    ],
  },

  /* ───────────────────────── ERP / S/4HANA ───────────────────────── */
  {
    id: "sap-erp-what",
    track: "sap",
    group: ERP,
    kind: "concept",
    verify: true,
    question: "What is ERP, in plain words?",
    keyPoints: [
      "ERP stands for enterprise resource planning",
      "One integrated system that runs a company's core processes: finance, procurement, manufacturing, supply chain, sales, HR",
      "The point is a single shared set of data, so every department works from the same numbers",
      "Example: a sales order reduces inventory, triggers an invoice and posts to accounting without anyone retyping it",
      "SAP is widely regarded as the market leader in ERP",
    ],
  },
  {
    id: "sap-erp-s4hana",
    track: "sap",
    group: ERP,
    kind: "concept",
    verify: true,
    question: "What is SAP S/4HANA?",
    keyPoints: [
      "SAP's current-generation ERP suite, introduced in 2015 as the successor to older SAP ERP (ECC, and R/3 before it)",
      "It runs on the SAP HANA in-memory database",
      "It is offered in cloud editions and for on-premise installation",
      "SAP Fiori is its modern, web-based user interface",
      "Many existing customers are still moving from older SAP systems to S/4HANA, which drives a lot of SAP's current work",
    ],
  },
  {
    id: "sap-erp-hana",
    track: "sap",
    group: ERP,
    kind: "concept",
    verify: true,
    question: "What is SAP HANA, and why does 'in-memory' matter?",
    keyPoints: [
      "HANA is SAP's relational database. S/4HANA is the application; HANA is the database underneath",
      "In-memory: it keeps data in RAM instead of reading from disk for each query, which makes it fast",
      "It stores data by column, which speeds up aggregation and analytics",
      "Result: transactions and reporting can run on the same live data, instead of copying data to a separate warehouse first",
      "You query it with SQL",
    ],
  },
  {
    id: "sap-erp-rise",
    track: "sap",
    group: ERP,
    kind: "concept",
    verify: true,
    question: "What is RISE with SAP?",
    keyPoints: [
      "A bundled offering, launched in 2021, for moving a company's SAP ERP to the cloud",
      "It combines S/4HANA Cloud, the infrastructure it runs on, and migration tools and services under one contract",
      "SAP describes it as business transformation as a service",
      "Related: GROW with SAP is aimed at customers adopting cloud ERP fresh, often midsize companies",
      "Stay at this level unless you have read the current description on sap.com",
    ],
  },

  /* ───────────────────────── BTP ───────────────────────── */
  {
    id: "sap-btp-what",
    track: "sap",
    group: BTP,
    kind: "concept",
    verify: true,
    question: "What is SAP BTP?",
    keyPoints: [
      "BTP stands for Business Technology Platform. It is SAP's cloud platform (platform as a service)",
      "Customers and partners use it to extend SAP applications, integrate SAP with non-SAP systems, and work with data, analytics and AI",
      "It runs on the major cloud providers' infrastructure, such as AWS, Microsoft Azure and Google Cloud",
      "One line: S/4HANA is the application, BTP is the platform you build on around it",
    ],
  },
  {
    id: "sap-btp-clean-core",
    track: "sap",
    group: BTP,
    kind: "concept",
    verify: true,
    question: "What does 'clean core' mean, and how does BTP relate to it?",
    keyPoints: [
      "Keep the standard ERP software unmodified so that upgrades stay simple",
      "Put custom logic in extensions that sit outside the core and connect through supported APIs",
      "BTP is where those extensions are typically built and run",
      "Why it matters: heavily customized older systems are hard to upgrade and hard to move to the cloud",
    ],
  },
  {
    id: "sap-btp-dev-stack",
    track: "sap",
    group: BTP,
    kind: "concept",
    verify: true,
    question: "If you built an application in the SAP world, which technologies would you be likely to meet?",
    keyPoints: [
      "ABAP: SAP's own programming language, central to the ERP core",
      "SAP Cloud Application Programming Model (CAP): a framework for building services in Node.js (JavaScript or TypeScript) or Java",
      "SAPUI5 and SAP Fiori for user interfaces",
      "SQL on HANA, and REST or OData APIs between systems",
      "Your overlap today: JavaScript, TypeScript, Java, SQL and REST APIs. Be honest that you have not used ABAP or CAP",
    ],
  },

  /* ───────────────────────── Business Data Cloud ───────────────────────── */
  {
    id: "sap-bdc-what",
    track: "sap",
    group: BDC,
    kind: "concept",
    verify: true,
    question: "What is SAP Business Data Cloud?",
    keyPoints: [
      "A data offering SAP announced in 2025",
      "It brings a company's SAP data and non-SAP data together in one managed cloud service for analytics and AI",
      "It delivers data as ready-made 'data products' that keep their business meaning, instead of raw tables someone has to rebuild",
      "It builds on SAP's existing data and analytics tools such as SAP Datasphere and SAP Analytics Cloud",
      "Why SAP cares: AI is only as good as the data it is grounded in",
    ],
  },
  {
    id: "sap-bdc-databricks",
    track: "sap",
    group: BDC,
    kind: "concept",
    verify: true,
    question: "What is the Databricks partnership in Business Data Cloud, and why does it matter?",
    keyPoints: [
      "Databricks is a data and AI platform used by data engineers and data scientists",
      "Business Data Cloud was announced together with a Databricks partnership: Databricks capabilities are offered inside it as SAP Databricks",
      "The selling point: teams can use SAP business data for machine learning and analytics without copying it back and forth between systems",
      "It signals that SAP is opening its data to tools customers already use",
      "Check whether further data partners have been announced since, before you discuss it",
    ],
  },

  /* ───────────────────────── Joule ───────────────────────── */
  {
    id: "sap-joule-what",
    track: "sap",
    group: JOULE,
    kind: "concept",
    verify: true,
    question: "What is Joule?",
    keyPoints: [
      "SAP's generative AI copilot, announced in 2023",
      "It is built into SAP's cloud applications, so users ask in natural language instead of navigating screens",
      "It answers and acts using the company's own business data, within the user's permissions",
      "Example use: asking for the status of orders, or getting help drafting HR content",
      "One line: a single assistant across SAP products",
    ],
  },
  {
    id: "sap-joule-agents",
    track: "sap",
    group: JOULE,
    kind: "concept",
    verify: true,
    question: "What are Joule agents, and how is an agent different from a chatbot?",
    keyPoints: [
      "A chatbot answers a question. An agent is given a goal and carries out several steps to reach it",
      "Joule agents plan steps, use tools and business data, and can work across functions such as finance, supply chain and HR",
      "A person stays in control of important decisions and approvals",
      "SAP also offers ways for customers to build their own agents. Check the current product name before using it",
      "Have one hypothetical example ready, such as an agent that investigates a disputed invoice and proposes a resolution",
    ],
  },
  {
    id: "sap-joule-business-ai",
    track: "sap",
    group: JOULE,
    kind: "concept",
    verify: true,
    question: "How does SAP describe its overall AI strategy?",
    keyPoints: [
      "The umbrella name is SAP Business AI: AI built into the applications people already use for work",
      "Three layers to remember: Joule as the assistant, AI features and agents embedded in the products, and AI services on BTP for building your own",
      "It is grounded in business data, which is why Business Data Cloud matters",
      "SAP's wording is that its AI should be relevant, reliable and responsible",
      "SAP works with several AI model providers rather than relying on one model of its own",
    ],
  },

  /* ───────────────────────── STAR program ───────────────────────── */
  {
    id: "sap-star-what",
    track: "sap",
    group: STAR,
    kind: "concept",
    verify: true,
    question: "What is the SAP STAR program?",
    keyPoints: [
      "A multi-year internship for university students: you work at SAP alongside your studies",
      "Rotational: you move through different teams or roles over the course of the program",
      "The goal is to develop students over several years, and it can lead toward full-time roles. Do not quote conversion rates",
      "STAR is usually expanded as Student Training and Rotation. Confirm the wording on the job posting",
      "Confirm the current structure (hours, rotation length, on-site expectations) with your recruiter rather than assuming",
      "Be able to say why this structure suits a first-year student",
    ],
  },
  {
    id: "sap-star-questions",
    track: "sap",
    group: STAR,
    kind: "concept",
    verify: true,
    question: "What should you ask your interviewers about the STAR program?",
    keyPoints: [
      "How rotations are chosen and how long each one lasts",
      "What a first-rotation student actually works on in the first month",
      "How the program fits around a class schedule and exams",
      "What past STAR students have gone on to do",
      "One question that shows you read about SAP, for example how the interviewer's team uses Joule or BTP",
      "Do not ask anything the job posting already answers",
    ],
  },
]);
