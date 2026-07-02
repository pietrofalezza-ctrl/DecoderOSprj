import type { KnowledgeEntry } from "../types";

export const javaFormat: KnowledgeEntry = {
  slug: "java-format",
  type: "format",
  category: "Formats",
  tags: ["java", "jvm", "language"],
  related: ["static-malware-analysis", "secret-detection", "dependency-analysis"],
  i18n: {
    en: {
      title: "Java — Supported format",
      metaTitle: "Java support in Decoder — .java static analysis with CWE mapping",
      metaDescription:
        "Decoder analyses .java files and Maven/Gradle projects: SQLi, deserialisation, hardcoded secrets, suspicious reflection.",
      intro:
        "Java is supported as a first-class format. Rules cover the common enterprise weakness classes mapped to CWE.",
      byLevel: {
        dev: {
          whatItIs: "Static rules tuned for Java idioms.",
          whyUseful:
            "Catches SQLi via JDBC concatenation, unsafe deserialisation (ObjectInputStream), hardcoded creds.",
          howDecoderImplements:
            "Pattern + AST-lite analysis, plus pom.xml / build.gradle dependency parsing.",
          whenToUse: "Enterprise codebases, Spring services, Android backends.",
          whenNotToUse: "Bytecode-level analysis — bring a dedicated tool.",
          practicalExample:
            "String SQL concat in a JDBC PreparedStatement misuse is flagged CWE-89.",
        },
      },
      faq: [
        { q: "Android?", a: "Source-level rules apply; APK binary analysis is out of scope." },
        { q: "Kotlin?", a: ".kt support is on the roadmap." },
      ],
      glossary: [
        {
          term: "JDBC",
          definition: "Java Database Connectivity — common SQLi vector when misused.",
        },
      ],
      cta: { label: "Scan a Java project", href: "/" },
    },
  },
};
