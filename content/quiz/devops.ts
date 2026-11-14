import { defineQuiz } from "@/lib/content/types";

export default defineQuiz([
  {
    id: "ops-container-vs-vm",
    topic: "devops",
    prompt: "What is the main difference between a container and a virtual machine?",
    choices: [
      "Containers need a hypervisor; VMs do not",
      "Containers share the host kernel; a VM runs its own OS",
      "VMs start faster and use far less memory than containers do",
      "A container emulates hardware; a VM is just a process",
    ],
    answer: 1,
    explain:
      "A VM virtualizes hardware and boots its own operating system on a hypervisor; a container is an isolated process that uses the host's kernel. That makes containers much lighter and faster to start, with weaker isolation than a VM.",
  },
  {
    id: "ops-image-vs-container",
    topic: "devops",
    prompt: "What is the relationship between a Docker image and a container?",
    choices: [
      "An image is a running container that has been paused and saved",
      "A container is a compressed backup of an image",
      "They are two words for exactly the same thing",
      "An image is a template; a container is a running instance",
    ],
    answer: 3,
    explain:
      "It is like class and object: you build an image once and can start many containers from it. docker build makes an image; docker run starts a container.",
  },
  {
    id: "ops-dockerfile",
    topic: "devops",
    prompt: "What is a Dockerfile?",
    choices: [
      "A text file of instructions for building an image",
      "A log of everything a container has printed",
      "A YAML file listing which containers run together",
      "The binary file that a container is stored in",
    ],
    answer: 0,
    explain:
      "A Dockerfile lists steps such as FROM (base image), COPY (add your code), RUN (install dependencies) and CMD (what to start). The YAML file for running several containers together is a Docker Compose file.",
  },
  {
    id: "ops-docker-why",
    topic: "devops",
    prompt: "What problem does Docker mainly solve?",
    choices: [
      "It makes code run faster than it would on bare metal hardware",
      "It replaces the need for version control such as git",
      "It ships an app with its dependencies so it runs the same anywhere",
      "It automatically finds and fixes security vulnerabilities",
    ],
    answer: 2,
    explain:
      "The image contains the app plus its runtime, libraries and system packages, so development, CI and production all run the same thing. It is the answer to 'it works on my machine'.",
  },
  {
    id: "ops-git-merge-vs-rebase",
    topic: "devops",
    prompt: "What is the difference between git merge and git rebase?",
    choices: [
      "Merge deletes the feature branch; rebase keeps it around",
      "Merge adds a merge commit; rebase replays your commits on top",
      "Rebase works on remote branches; merge only on local ones",
      "Merge rewrites commit hashes; rebase never changes them",
    ],
    answer: 1,
    explain:
      "Merge preserves history exactly as it happened. Rebase rewrites your commits onto the tip of the target branch for a linear history, which changes their hashes, so avoid rebasing commits other people have already pulled.",
  },
  {
    id: "ops-git-branch",
    topic: "devops",
    prompt: "What is a branch in git?",
    choices: [
      "A movable pointer to a commit",
      "A full copy of the repository in a new folder",
      "A backup of the project stored on GitHub",
      "A commit that has not been pushed yet",
    ],
    answer: 0,
    explain:
      "A branch is a lightweight name pointing at a commit, and it moves forward as you commit. That is why creating one is instant and why each feature or fix gets its own.",
  },
  {
    id: "ops-git-commit",
    topic: "devops",
    prompt: "What does a git commit record?",
    choices: [
      "Only the lines that changed since your last push to GitHub",
      "Every file on your disk, tracked or not",
      "A snapshot of the staged changes, plus a message",
      "A request for teammates to review your code",
    ],
    answer: 2,
    explain:
      "git add stages changes, and git commit saves that staged snapshot to local history with an author, a message, a parent pointer and a unique SHA hash. Nothing reaches the remote until you push.",
  },
  {
    id: "ops-pull-request",
    topic: "devops",
    prompt: "What is a pull request?",
    choices: [
      "The git command that downloads new commits",
      "A way to undo the most recent commit",
      "A personal copy of someone else's repository under your account",
      "A proposal to merge one branch into another, with review",
    ],
    answer: 3,
    explain:
      "A pull request is a feature of hosts like GitHub, not a git command: it shows the diff, lets teammates comment and approve, and runs CI before the merge. Downloading commits is git pull, and the copy under your account is a fork.",
  },
  {
    id: "ops-grep",
    topic: "devops",
    prompt: 'What does grep -r "TODO" src/ do?',
    choices: [
      "Renames every file under src/ whose name contains TODO",
      "Prints lines containing TODO in files under src/",
      "Deletes every line that contains TODO",
      "Counts how many files exist under src/",
    ],
    answer: 1,
    explain:
      "grep searches text for a pattern and prints the matching lines; -r recurses through a directory. Useful flags are -i to ignore case, -n to show line numbers and -v to invert the match.",
  },
  {
    id: "ops-pipe",
    topic: "devops",
    prompt: "What does the pipe do in cat access.log | grep 404 | wc -l?",
    choices: [
      "Runs the three commands separately on the same file",
      "Writes each command's output to its own file",
      "Feeds each command's output into the next one's input",
      "Runs the next command only if the previous one failed",
    ],
    answer: 2,
    explain:
      "A pipe connects one command's standard output to the next command's standard input, so small tools compose. This pipeline counts the lines in the log that contain 404.",
  },
  {
    id: "ops-chmod-755",
    topic: "devops",
    prompt: "What permissions does chmod 755 script.sh set?",
    choices: [
      "Owner: read, write, execute. Group and others: read, execute",
      "Owner, group and others all get read, write, execute",
      "Owner: read, write. Group and others: read only",
      "Owner: read, execute. Group and others: read, write, execute",
    ],
    answer: 0,
    explain:
      "The digits are owner, group, others, and each is a sum of read=4, write=2, execute=1. So 7 is rwx and 5 is r-x. 644 (rw-r--r--) is the usual value for files that are not executable.",
  },
  {
    id: "ops-permission-string",
    topic: "devops",
    prompt: "ls -l shows -rw-r--r-- for a file. Which regular users can modify it?",
    choices: ["Everyone", "The owner and the group", "Nobody", "Only the owner"],
    answer: 3,
    explain:
      "After the file-type character, the string is three triples: owner (rw-), group (r--), others (r--). Only the owner triple contains w, so only the owner can write.",
  },
  {
    id: "ops-gcp-what",
    topic: "devops",
    prompt: "What is Google Cloud Platform (GCP)?",
    choices: [
      "Rented computing and storage in Google's data centers",
      "Google's desktop operating system for developers",
      "A programming language created by Google",
      "Google's code hosting site, an alternative to GitHub",
    ],
    answer: 0,
    explain:
      "GCP is Google's public cloud, comparable to AWS and Azure: you rent virtual machines, storage, databases and managed services and pay for what you use instead of running your own servers.",
  },
  {
    id: "ops-gcp-cloud-storage",
    topic: "devops",
    prompt: "Which GCP service is designed for storing files such as images and backups as objects?",
    choices: ["Compute Engine", "BigQuery", "Cloud Storage", "Cloud Run"],
    answer: 2,
    explain:
      "Cloud Storage keeps objects in buckets, like AWS S3. Compute Engine provides virtual machines, Cloud Run runs containers without you managing servers, and BigQuery is a data warehouse for SQL analytics.",
  },
]);
