import { defineQuiz } from "@/lib/content/types";

export default defineQuiz([
  {
    id: "oop-four-pillars",
    topic: "oop-java",
    prompt: "What are the four pillars of object-oriented programming?",
    choices: [
      "Classes, objects, methods, attributes",
      "Encapsulation, compilation, inheritance, recursion",
      "Encapsulation, abstraction, inheritance, polymorphism",
      "Abstraction, iteration, inheritance, composition",
    ],
    answer: 2,
    explain:
      "Encapsulation hides state behind methods, abstraction exposes what an object does and not how, inheritance reuses a parent class, and polymorphism lets one call behave differently per type. Have a one-line example ready for each.",
  },
  {
    id: "oop-encapsulation",
    topic: "oop-java",
    prompt: "Which of these is the best example of encapsulation?",
    choices: [
      "A private balance field changed only via deposit()",
      "A Dog class that extends an Animal class",
      "Two methods named print with different parameters",
      "A subclass replacing the toString() method of its parent",
    ],
    answer: 0,
    explain:
      "Encapsulation bundles data with the methods that operate on it and restricts direct access, so the class can protect its own rules (no negative balance). The other choices show inheritance, overloading and overriding.",
  },
  {
    id: "oop-polymorphism",
    topic: "oop-java",
    prompt: "Animal a = new Dog();\na.speak();\nDog overrides speak(). Which version runs, and what is this called?",
    choices: [
      "Animal's version; static binding",
      "Dog's version; polymorphism",
      "Animal's version; encapsulation",
      "Neither; a Dog cannot be stored as an Animal",
    ],
    answer: 1,
    explain:
      "The method is chosen by the object's actual runtime type, not the declared type of the variable. This dynamic dispatch is polymorphism: one interface, many implementations.",
  },
  {
    id: "oop-class-vs-object",
    topic: "oop-java",
    prompt: "What is the relationship between a class and an object?",
    choices: [
      "A class is a collection of objects",
      "An object is a class that has no methods",
      "They are the same; object is just the Python word for class",
      "A class is the blueprint; an object is an instance of it",
    ],
    answer: 3,
    explain:
      "The class defines fields and methods once; each object created from it (with new in Java, or by calling the class in Python) has its own state. Car is a class, your specific car is an object.",
  },
  {
    id: "oop-interface-vs-abstract-class",
    topic: "oop-java",
    prompt: "In Java, what is a key difference between an interface and an abstract class?",
    choices: [
      "A class can implement many interfaces but extend only one class",
      "An abstract class cannot contain any implemented methods",
      "An interface can be instantiated with new; an abstract class cannot",
      "An interface can declare constructors; an abstract class cannot",
    ],
    answer: 0,
    explain:
      "Java allows single inheritance of classes but multiple interfaces. An abstract class can hold instance fields, constructors and implemented methods; an interface is a contract with no instance state. Neither can be instantiated directly.",
  },
  {
    id: "oop-overloading-vs-overriding",
    topic: "oop-java",
    prompt: "A class defines add(int a, int b) and add(double a, double b). What is this called?",
    choices: ["Overriding", "Encapsulation", "Overloading", "Inheritance"],
    answer: 2,
    explain:
      "Overloading is the same method name with different parameter lists in one class, resolved at compile time. Overriding is a subclass redefining an inherited method with the same signature, resolved at runtime.",
  },
  {
    id: "oop-java-jvm-bytecode",
    topic: "oop-java",
    prompt: "How does Java achieve 'write once, run anywhere'?",
    choices: [
      "The source code is interpreted line by line on each machine",
      "javac compiles to bytecode, which any JVM can run",
      "javac produces a separate native executable per operating system",
      "Java programs always run inside a web browser",
    ],
    answer: 1,
    explain:
      "The compiler produces platform-neutral bytecode in .class files, and each operating system has its own JVM that executes it, using a JIT compiler to turn frequently run code into native machine code.",
  },
  {
    id: "oop-java-static",
    topic: "oop-java",
    prompt: "What does the static keyword mean on a Java field or method?",
    choices: [
      "Its value can never change",
      "It can only be accessed from inside its own class",
      "It is created fresh for every object",
      "It belongs to the class, not to any one instance",
    ],
    answer: 3,
    explain:
      "A static member is shared by all instances and can be used without creating an object, as in Math.max(). 'Can never change' is final, and 'visible only inside the class' is private.",
  },
  {
    id: "oop-java-constructor",
    topic: "oop-java",
    prompt: "Which statement about Java constructors is true?",
    choices: [
      "A class can have only one constructor",
      "A constructor must declare a void return type",
      "It shares the class's name and runs when new is called",
      "It runs automatically when an object is garbage collected",
    ],
    answer: 2,
    explain:
      "A constructor initializes a new object. It has no return type, it can be overloaded, and if you write none the compiler supplies a no-argument default constructor.",
  },
  {
    id: "oop-java-string-equals",
    topic: "oop-java",
    prompt: "In Java, why compare strings with a.equals(b) rather than a == b?",
    choices: [
      "== compares references; equals compares the characters",
      "== does not compile when the operands are Strings",
      "equals is faster than == for long strings",
      "== ignores upper and lower case; equals does not",
    ],
    answer: 0,
    explain:
      "For objects, == asks whether both variables point to the same object, while equals compares contents. It is the same distinction as is versus == in Python.",
  },
  {
    id: "oop-abstraction",
    topic: "oop-java",
    prompt: "You call list.sort() without knowing which sorting algorithm runs underneath. Which OOP idea is that?",
    choices: ["Inheritance", "Abstraction", "Polymorphism", "Overloading"],
    answer: 1,
    explain:
      "Abstraction means exposing what something does through a simple interface while hiding how it does it. Encapsulation is the related mechanism of keeping the internal state private.",
  },
  {
    id: "oop-java-vs-python-typing",
    topic: "oop-java",
    prompt: "What is a key difference between Java and Python in how they handle types?",
    choices: [
      "Java has no type system; Python does",
      "Python variables must declare a type; Java variables need not",
      "Java checks types only at runtime; Python checks at compile time",
      "Java is statically typed; Python is dynamically typed",
    ],
    answer: 3,
    explain:
      "In Java every variable has a type fixed at compile time, and the compiler rejects mismatches before the program runs. In Python types belong to values and are checked as the code executes.",
  },
]);
