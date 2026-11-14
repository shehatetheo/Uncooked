import { defineQuiz } from "@/lib/content/types";

export default defineQuiz([
  {
    id: "sec-tcp-vs-udp",
    topic: "security",
    prompt: "What is the main difference between TCP and UDP?",
    choices: [
      "TCP is encrypted; UDP is not",
      "UDP is used on Wi-Fi; TCP on wired networks",
      "TCP guarantees reliable, ordered delivery",
      "UDP sets up a connection first; TCP just sends",
    ],
    answer: 2,
    explain:
      "TCP is connection-oriented: it acknowledges, retransmits and orders data, at the cost of overhead. UDP is connectionless and just sends datagrams, which is faster, but packets can be lost or arrive out of order.",
  },
  {
    id: "sec-udp-use-case",
    topic: "security",
    prompt: "Which of these is the best fit for UDP rather than TCP?",
    choices: ["A live voice call", "Downloading a file", "Logging in over SSH", "Sending an email"],
    answer: 0,
    explain:
      "Real-time audio, video and games prefer a lost packet to a late one, so they skip TCP's retransmission delays. DNS lookups also normally use UDP. File transfer, SSH and email need every byte in order, so they use TCP.",
  },
  {
    id: "sec-three-way-handshake",
    topic: "security",
    prompt: "What is the sequence of the TCP three-way handshake?",
    choices: ["SYN, ACK, FIN", "SYN, SYN-ACK, ACK", "ACK, SYN, SYN-ACK", "SYN, FIN, ACK"],
    answer: 1,
    explain:
      "The client sends SYN, the server replies SYN-ACK, and the client answers ACK; both sides have then agreed on starting sequence numbers and the connection is open. In Wireshark these are the first three packets of every TCP connection.",
  },
  {
    id: "sec-wireshark",
    topic: "security",
    prompt: "What does Wireshark do?",
    choices: [
      "Blocks malicious traffic at the network edge",
      "Scans a host for open ports",
      "Cracks password hashes",
      "Captures network packets for inspection",
    ],
    answer: 3,
    explain:
      "Wireshark is a packet analyzer: it records traffic on an interface and decodes each protocol layer, with display filters such as dns or tcp.port == 443. It only observes; it does not block anything. Port scanning is the job of nmap.",
  },
  {
    id: "sec-cia-triad",
    topic: "security",
    prompt: "What does the CIA triad stand for in security?",
    choices: [
      "Confidentiality, Integrity, Availability",
      "Control, Identification, Authentication",
      "Confidentiality, Isolation, Authorization",
      "Compliance, Integrity, Auditing",
    ],
    answer: 0,
    explain:
      "Confidentiality means only authorized people can read the data, integrity means it is not altered improperly, and availability means it is accessible when needed. Most security controls map to one of the three.",
  },
  {
    id: "sec-cia-availability",
    topic: "security",
    prompt: "A DDoS attack floods a website so real users cannot reach it. Which part of the CIA triad is under attack?",
    choices: ["Confidentiality", "Integrity", "Availability", "Authentication"],
    answer: 2,
    explain:
      "Nothing is stolen or modified; the service is simply made unreachable, which is an availability failure. A data leak would hit confidentiality, and tampering would hit integrity.",
  },
  {
    id: "sec-siem",
    topic: "security",
    prompt: "What is a SIEM used for?",
    choices: [
      "Encrypting the files on every employee's laptop",
      "Collecting and correlating logs to raise alerts",
      "Filtering spam out of incoming email",
      "Storing employee passwords in a secure vault",
    ],
    answer: 1,
    explain:
      "Security Information and Event Management tools such as Splunk or Microsoft Sentinel pull logs from firewalls, servers, endpoints and cloud services into one place and apply rules to spot suspicious patterns. It is the main screen a SOC analyst works from.",
  },
  {
    id: "sec-phishing",
    topic: "security",
    prompt: "What is phishing?",
    choices: [
      "Guessing a password by trying every possible combination",
      "Intercepting traffic on a public Wi-Fi network",
      "Flooding a server with more requests than it can handle",
      "Fake messages that trick people into revealing secrets",
    ],
    answer: 3,
    explain:
      "Phishing is social engineering: an email, text or site pretends to be a trusted party to get you to click a link, enter a password or open an attachment. Defenses are user training, MFA and checking the sender and URL.",
  },
  {
    id: "sec-least-privilege",
    topic: "security",
    prompt: "What is the principle of least privilege?",
    choices: [
      "Give each user or service only the access it needs",
      "Give administrators as few passwords as possible",
      "Deny all access until a security audit has passed",
      "Give new employees read access to everything",
    ],
    answer: 0,
    explain:
      "Minimal permissions limit the damage when an account is compromised or someone makes a mistake. Example: an app's database user that can read and write its own tables but cannot drop the database.",
  },
  {
    id: "sec-hashing-vs-encryption",
    topic: "security",
    prompt: "What is the difference between hashing and encryption?",
    choices: [
      "Hashing needs a key; encryption does not",
      "Encryption is one-way; hashing can be reversed",
      "Hashing is one-way; encryption can be reversed with a key",
      "They are the same thing; hashing is just the faster version",
    ],
    answer: 2,
    explain:
      "A hash function maps any input to a fixed-size digest that cannot be turned back into the input, so it is used for integrity checks and password storage. Encryption is meant to be decrypted by whoever holds the key, so it is used for confidentiality.",
  },
  {
    id: "sec-password-storage",
    topic: "security",
    prompt: "How should a web app store user passwords?",
    choices: [
      "Encrypted with a key kept in the same database",
      "As salted hashes from a slow algorithm like bcrypt",
      "In plain text, but in a table only admins can read",
      "Encoded with Base64 before being saved",
    ],
    answer: 1,
    explain:
      "The server never needs the original password, only a way to check it, so it stores a one-way hash. A per-user salt defeats precomputed tables, and a deliberately slow algorithm (bcrypt, scrypt, Argon2) makes brute force expensive.",
  },
  {
    id: "sec-symmetric-vs-asymmetric",
    topic: "security",
    prompt: "What distinguishes symmetric from asymmetric encryption?",
    choices: [
      "Symmetric encrypts text; asymmetric encrypts binary files",
      "Symmetric uses two keys; asymmetric uses a single key",
      "Asymmetric is always the faster of the two",
      "Symmetric uses one shared key; asymmetric uses a key pair",
    ],
    answer: 3,
    explain:
      "Symmetric ciphers like AES use the same secret key to encrypt and decrypt and are fast. Asymmetric schemes like RSA use a public key anyone may have and a private key kept secret. TLS uses asymmetric crypto to agree on a symmetric key, then switches to it.",
  },
  {
    id: "sec-kali-linux",
    topic: "security",
    prompt: "What is Kali Linux?",
    choices: [
      "A Linux distribution packed with security testing tools",
      "An antivirus product for Linux servers",
      "A hardened Linux kernel used inside firewalls",
      "A cloud service for hosting hardened Linux virtual machines",
    ],
    answer: 0,
    explain:
      "Kali is a Debian-based distribution that ships with tools such as nmap, Wireshark, Metasploit and Burp Suite. It is used for penetration testing and security training, and only against systems you are authorized to test.",
  },
  {
    id: "sec-dns",
    topic: "security",
    prompt: "What does DNS do?",
    choices: [
      "Assigns IP addresses to devices joining a network",
      "Encrypts traffic between browser and server",
      "Translates domain names into IP addresses",
      "Chooses the route packets take between networks",
    ],
    answer: 2,
    explain:
      "DNS is the internet's phone book: your machine asks a resolver for the IP address behind a name like sap.com before it can connect. Handing out addresses on a local network is DHCP.",
  },
  {
    id: "sec-firewall",
    topic: "security",
    prompt: "What does a firewall do?",
    choices: [
      "Scans files for known malware signatures",
      "Allows or blocks network traffic based on rules",
      "Encrypts all data leaving the network",
      "Backs up data in case of an attack",
    ],
    answer: 1,
    explain:
      "A firewall sits between networks, or on a host, and filters traffic by rules on things like source and destination IP, port and protocol, for example allowing only port 443 inbound. Scanning files for malware is antivirus.",
  },
  {
    id: "sec-soc-analyst",
    topic: "security",
    prompt: "What is the core day-to-day job of a tier 1 SOC analyst?",
    choices: [
      "Writing and reviewing the company's application code",
      "Running penetration tests against client systems",
      "Installing network cables and server hardware",
      "Triaging security alerts and escalating real incidents",
    ],
    answer: 3,
    explain:
      "A Security Operations Center monitors an organization's systems for threats. Tier 1 analysts review alerts from the SIEM, decide whether each is a false positive or a real threat, document it, and escalate confirmed incidents to higher tiers.",
  },
]);
