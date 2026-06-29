import type { KnowledgeLang, KnowledgeLocale } from "./types";

/**
 * Translation overlay for the top SEO/UX entries.
 * Merged into each entry's `i18n` at registry build time.
 * English remains the source of truth in entries/*.ts.
 * Untranslated entries fall back to English via getLocale().
 */
export const KNOWLEDGE_TRANSLATIONS: Record<
  string,
  Partial<Record<Exclude<KnowledgeLang, "en">, KnowledgeLocale>>
> = {
  "static-malware-analysis": {
    it: {
      title: "Analisi statica e malware",
      metaTitle: "Analisi statica e malware del codice — Decoder",
      metaDescription:
        "Scansione statica e antimalware sul codice sorgente: pattern, entropia, secret detection. Nessuna chiave AI richiesta.",
      intro:
        "Analisi statica e malware lavorano sul codice sorgente senza eseguirlo: regole deterministiche, pattern noti, entropia e indicatori di obfuscation.",
      byLevel: {
        beginner: {
          whatItIs: "Decoder legge il codice come testo e segnala cose pericolose, senza eseguirle.",
          whyUseful: "Trovi problemi prima che il codice venga lanciato, gratis e senza chiavi AI.",
          howDecoderImplements: "Pattern, regole YARA, controllo entropia e rilevamento segreti girano in locale sul server.",
          whenToUse: "Sempre come primo passo prima di eseguire o pubblicare uno script.",
          whenNotToUse: "Quando serve capire l'intento profondo del codice: lì entra l'AI (opzionale).",
          practicalExample: "Carichi un .ps1, Decoder evidenzia comandi DownloadString e stringhe Base64 sospette.",
        },
        dev: {
          whatItIs: "Pipeline statica multi-linguaggio che combina regole, YARA, entropia e secret scanning sul source.",
          whyUseful: "Feedback deterministico, riproducibile, senza inviare il codice a un LLM.",
          howDecoderImplements: "Parser per linguaggio, regole versionate, scoring CWE-aware, output strutturato per UI e API.",
          whenToUse: "Come baseline di sicurezza in ogni triage o code review.",
          whenNotToUse: "Quando il valore è la spiegazione semantica: combina con la modalità AI Explain.",
          practicalExample: "Su un repo Node, Decoder trova require dinamici, scripts npm sospetti e token in chiaro in .env.",
        },
      },
      faq: [
        { q: "Serve una chiave AI?", a: "No. L'analisi statica e malware è gratuita e non chiama nessun provider esterno." },
        { q: "Quali file supporta?", a: "Python, JavaScript/TypeScript, Java, Go, Rust, PowerShell, ZIP, Dockerfile e oltre 20 formati." },
        { q: "I miei file vengono salvati?", a: "Solo per la sessione corrente: niente training, niente condivisione." },
      ],
      glossary: [
        { term: "Entropia", definition: "Misura della casualità di una stringa — alta entropia segnala spesso payload offuscati o segreti." },
        { term: "YARA", definition: "Linguaggio di regole per descrivere e cercare pattern di malware nel codice o nei binari." },
      ],
      cta: { label: "Avvia un'analisi", href: "/" },
    },
    zh: {
      title: "静态与恶意软件分析",
      metaTitle: "静态与恶意代码分析 — Decoder",
      metaDescription:
        "对源代码进行静态与恶意软件扫描:模式匹配、熵分析、密钥检测,无需 AI 密钥。",
      intro:
        "静态与恶意软件分析在不运行代码的前提下,通过确定性规则、已知模式、熵值和混淆指标对源码进行检查。",
      byLevel: {
        beginner: {
          whatItIs: "Decoder 把代码当作文本来读,并标出危险的部分,完全不执行。",
          whyUseful: "在运行之前就能发现问题,免费且无需 AI 密钥。",
          howDecoderImplements: "模式、YARA 规则、熵检测和密钥扫描在服务器本地运行。",
          whenToUse: "在执行或发布任何脚本前作为第一步。",
          whenNotToUse: "当你需要深入理解代码意图时——那时再启用可选的 AI。",
          practicalExample: "上传一个 .ps1,Decoder 会标出 DownloadString 与可疑的 Base64 字符串。",
        },
      },
      faq: [
        { q: "需要 AI 密钥吗?", a: "不需要。静态与恶意软件分析免费,且不会调用任何外部模型。" },
        { q: "支持哪些文件?", a: "Python、JavaScript/TypeScript、Java、Go、Rust、PowerShell、ZIP、Dockerfile 等 20+ 格式。" },
      ],
      glossary: [
        { term: "熵", definition: "字符串随机性的度量,高熵常意味着混淆或密钥。" },
        { term: "YARA", definition: "用于描述并搜索代码或二进制文件中恶意模式的规则语言。" },
      ],
      cta: { label: "开始分析", href: "/" },
    },
  },

  byok: {
    it: {
      title: "BYOK — Porta la tua chiave",
      metaTitle: "BYOK in Decoder — Porta la tua chiave AI",
      metaDescription:
        "BYOK ti permette di collegare il tuo provider AI (OpenAI, Anthropic, Gemini, OpenRouter) a Decoder. Cifrata a riposo, mai condivisa.",
      intro:
        "BYOK significa portare la propria chiave AI: niente account condiviso, la tua fatturazione, il tuo perimetro di privacy.",
      byLevel: {
        beginner: {
          whatItIs: "Colleghi il tuo account AI personale a Decoder invece di usarne uno condiviso.",
          whyUseful: "Uso tuo, fatturazione tua, privacy tua: nessun altro vede o paga al posto tuo.",
          howDecoderImplements: "Incolli la chiave in Impostazioni, viene cifrata e usata solo per le tue richieste.",
          whenToUse: "Quando vuoi spiegazioni AI, chat sul codice o verbalizzazioni AI-origin.",
          whenNotToUse: "Se ti bastano le analisi statiche e malware: non serve alcuna chiave.",
          practicalExample: "Aggiungi una chiave OpenRouter, clicchi Spiega su una funzione: Decoder chiama come te.",
        },
        dev: {
          whatItIs: "Pattern in cui l'app accetta credenziali del provider portate dall'utente invece di un account backend condiviso.",
          whyUseful: "Elimina il trust condiviso, semplifica compliance, isola i rate-limit per utente.",
          howDecoderImplements: "Chiavi cifrate AES-256-GCM, decifrate solo lato server-function, mai restituite al client.",
          whenToUse: "Per qualsiasi feature AI multi-tenant in contesti privacy-sensitive.",
          whenNotToUse: "Se l'utente non deve mai vedere errori 4xx del provider.",
          practicalExample: "Settings → aggiungi chiave → ciphertext in user_ai_credentials; revoca = invalidazione immediata.",
        },
      },
      faq: [
        { q: "Dove viene salvata la mia chiave?", a: "Cifrata AES-256-GCM nel database, accessibile solo al tuo utente tramite RLS." },
        { q: "Gli admin di Decoder possono leggerla?", a: "No: la decifratura avviene solo dentro la server function che chiama il provider." },
        { q: "Quali provider sono supportati?", a: "OpenAI, Anthropic, Gemini, OpenRouter. In alternativa puoi usare modelli locali (Ollama, LM Studio)." },
      ],
      glossary: [
        { term: "BYOK", definition: "Bring Your Own Key — l'utente fornisce le proprie credenziali del provider." },
        { term: "RLS", definition: "Row-Level Security — policy a livello DB che isola le righe per utente autenticato." },
      ],
      cta: { label: "Aggiungi la tua chiave", href: "/settings" },
    },
    zh: {
      title: "BYOK — 自带密钥",
      metaTitle: "Decoder 中的 BYOK — 自带 AI 密钥",
      metaDescription:
        "BYOK 让你把自己的 AI 提供商(OpenAI、Anthropic、Gemini、OpenRouter)接入 Decoder,密文存储,绝不共享。",
      intro:
        "BYOK 意味着自带 AI 密钥:不走共享账户,你自己的账单,你自己的隐私边界。",
      byLevel: {
        beginner: {
          whatItIs: "把你个人的 AI 账号接入 Decoder,而不是用共享账号。",
          whyUseful: "使用、费用、隐私都归你自己。",
          howDecoderImplements: "在设置中粘贴密钥,Decoder 会加密并仅用于你的请求。",
          whenToUse: "当你需要 AI 解释、代码聊天或 AI 来源识别时。",
          whenNotToUse: "如果只用静态与恶意软件扫描,则无需任何密钥。",
          practicalExample: "添加 OpenRouter 密钥,点击 Explain,Decoder 以你的身份调用 OpenRouter。",
        },
      },
      faq: [
        { q: "我的密钥存在哪里?", a: "以 AES-256-GCM 加密存储,通过 RLS 仅限你本人访问。" },
        { q: "支持哪些提供商?", a: "OpenAI、Anthropic、Gemini、OpenRouter;也可使用本地模型(Ollama、LM Studio)。" },
      ],
      glossary: [{ term: "BYOK", definition: "Bring Your Own Key,用户自带提供商凭证。" }],
      cta: { label: "添加你的密钥", href: "/settings" },
    },
  },

  "repository-analysis": {
    it: {
      title: "Analisi di repository",
      metaTitle: "Analisi di repository — Decoder",
      metaDescription:
        "Analizza interi repository GitHub o ZIP: scansione statica, malware, dipendenze e chat con il codice.",
      intro:
        "Carichi un repository (ZIP o URL GitHub) e Decoder lo apre, lo classifica per linguaggio e lo passa attraverso le pipeline di analisi.",
      byLevel: {
        beginner: {
          whatItIs: "Dai a Decoder un intero progetto e lui ti dice cosa contiene e dove sono i problemi.",
          whyUseful: "Visione d'insieme prima di leggere file per file.",
          howDecoderImplements: "Estrae lo ZIP, indicizza i file, lancia analisi statica/malware e abilita la chat sul progetto.",
          whenToUse: "Per audit di codice ricevuto, fork sconosciuti o repo legacy.",
          whenNotToUse: "Per un singolo file: lì basta l'upload diretto.",
          practicalExample: "Incolli un URL GitHub: in pochi secondi vedi linguaggi, file sospetti e una chat pronta a rispondere.",
        },
      },
      faq: [
        { q: "Posso analizzare repo privati?", a: "Sì, caricando lo ZIP esportato. L'integrazione GitHub OAuth è in roadmap." },
        { q: "C'è un limite di dimensione?", a: "Sì, per proteggere il server: ZIP molto grandi vengono rifiutati con un messaggio chiaro." },
      ],
      glossary: [{ term: "ZIP", definition: "Archivio standard usato per impacchettare un repository." }],
      cta: { label: "Carica un repository", href: "/" },
    },
    zh: {
      title: "仓库分析",
      metaTitle: "仓库分析 — Decoder",
      metaDescription: "分析整个 GitHub 仓库或 ZIP:静态扫描、恶意软件检测、依赖与代码聊天。",
      intro: "上传 ZIP 或 GitHub URL,Decoder 解析、分类语言,并依次跑通分析流水线。",
      byLevel: {
        beginner: {
          whatItIs: "把整个项目交给 Decoder,它会告诉你里面有什么、问题在哪。",
          whyUseful: "在逐个文件阅读之前获得全景视图。",
          howDecoderImplements: "解压 ZIP、索引文件、跑静态/恶意软件分析,并启用项目聊天。",
          whenToUse: "审查他人代码、未知 fork 或遗留仓库时。",
          whenNotToUse: "单个文件直接上传更快。",
          practicalExample: "粘贴 GitHub URL,几秒后即可看到语言分布、可疑文件并开始聊天。",
        },
      },
      faq: [{ q: "支持私有仓库吗?", a: "可上传导出的 ZIP;GitHub OAuth 集成在路线图中。" }],
      glossary: [{ term: "ZIP", definition: "用于打包仓库的标准压缩格式。" }],
      cta: { label: "上传仓库", href: "/" },
    },
  },

  "local-ai": {
    it: {
      title: "AI locale",
      metaTitle: "AI locale in Decoder — Inferenza on-device",
      metaDescription:
        "Esegui modelli AI in locale (Ollama, LM Studio) e usali in Decoder senza inviare il codice a provider esterni.",
      intro:
        "L'AI locale fa girare i modelli sul tuo computer: niente chiave cloud, niente codice fuori dalla tua rete.",
      byLevel: {
        beginner: {
          whatItIs: "Un modello AI installato sul tuo computer che Decoder può chiamare al posto di OpenAI o simili.",
          whyUseful: "Il codice non lascia mai la tua macchina.",
          howDecoderImplements: "Decoder rileva Ollama/LM Studio in ascolto su localhost e lo offre come provider AI.",
          whenToUse: "Per repository riservati, audit interni o lavoro offline.",
          whenNotToUse: "Quando ti serve la qualità dei modelli frontier più recenti.",
          practicalExample: "Avvii Ollama con llama3, in Decoder selezioni 'Local AI' e ottieni spiegazioni senza BYOK cloud.",
        },
      },
      faq: [{ q: "Servono GPU?", a: "Aiutano molto, ma piccoli modelli quantizzati girano anche solo su CPU." }],
      glossary: [{ term: "Inferenza", definition: "Esecuzione di un modello AI per produrre output da un input." }],
      cta: { label: "Configura AI locale", href: "/settings" },
    },
    zh: {
      title: "本地 AI",
      metaTitle: "Decoder 中的本地 AI — 端侧推理",
      metaDescription:
        "在本地运行 AI 模型(Ollama、LM Studio)并在 Decoder 中使用,无需将代码发送给外部提供商。",
      intro: "本地 AI 把模型跑在你自己的机器上:不需要云密钥,代码也不出你的网络。",
      byLevel: {
        beginner: {
          whatItIs: "装在你电脑上的 AI 模型,Decoder 可调用以替代 OpenAI 等。",
          whyUseful: "代码永远不会离开你的机器。",
          howDecoderImplements: "Decoder 检测 localhost 上的 Ollama/LM Studio 并将其作为 AI 提供商。",
          whenToUse: "机密仓库、内部审计或离线工作时。",
          whenNotToUse: "当你需要最新前沿模型质量时。",
          practicalExample: "启动 Ollama 加载 llama3,在 Decoder 中选择 Local AI 即可获得解释。",
        },
      },
      faq: [{ q: "需要 GPU 吗?", a: "GPU 帮助很大,但量化小模型仅靠 CPU 也能跑。" }],
      glossary: [{ term: "推理", definition: "运行 AI 模型从输入产生输出的过程。" }],
      cta: { label: "配置本地 AI", href: "/settings" },
    },
  },

  ollama: {
    it: {
      title: "Ollama",
      metaTitle: "Ollama in Decoder — Modelli locali via localhost",
      metaDescription: "Decoder si collega a Ollama in localhost per chiamare modelli AI locali in modo privato.",
      intro: "Ollama è il runtime più comodo per servire modelli AI locali via HTTP. Decoder lo usa come provider.",
      byLevel: {
        beginner: {
          whatItIs: "Un programma che fa girare modelli AI sul tuo computer e li espone come una piccola API.",
          whyUseful: "Una volta installato, qualsiasi app — Decoder incluso — può chiedergli una spiegazione senza internet.",
          howDecoderImplements: "Decoder chiama http://localhost:11434, elenca i tuoi modelli e li usa come provider AI.",
          whenToUse: "Quando vuoi privacy totale o un budget zero verso provider cloud.",
          whenNotToUse: "Se hai bisogno di context window enormi o ragionamento di alto livello.",
          practicalExample: "ollama pull llama3, riapri Decoder: il modello compare tra i provider disponibili.",
        },
      },
      faq: [{ q: "Devo aprire porte sulla rete?", a: "No, Decoder parla con Ollama via localhost dalla tua macchina." }],
      glossary: [{ term: "Localhost", definition: "Indirizzo di rete che punta alla tua stessa macchina." }],
      cta: { label: "Collega Ollama", href: "/settings" },
    },
    zh: {
      title: "Ollama",
      metaTitle: "Decoder 中的 Ollama — 通过 localhost 调用本地模型",
      metaDescription: "Decoder 通过 localhost 连接 Ollama,在本地隐私地调用 AI 模型。",
      intro: "Ollama 是最便捷的本地模型 HTTP 服务,Decoder 把它当作提供商使用。",
      byLevel: {
        beginner: {
          whatItIs: "在你电脑上运行 AI 模型并暴露为小型 API 的程序。",
          whyUseful: "任何应用(包括 Decoder)都能离线向它请求解释。",
          howDecoderImplements: "Decoder 调用 http://localhost:11434,列出你的模型并作为 AI 提供商使用。",
          whenToUse: "需要绝对隐私或零云端预算时。",
          whenNotToUse: "需要超大上下文或最高级推理能力时。",
          practicalExample: "ollama pull llama3,在 Decoder 中即可看到该模型。",
        },
      },
      faq: [{ q: "需要开放网络端口吗?", a: "不需要,Decoder 只通过本机 localhost 与 Ollama 通讯。" }],
      glossary: [{ term: "Localhost", definition: "指向本机自己的网络地址。" }],
      cta: { label: "连接 Ollama", href: "/settings" },
    },
  },

  "chat-with-code": {
    it: {
      title: "Chat con il tuo codice",
      metaTitle: "Chat con il codice — Decoder",
      metaDescription:
        "Fai domande in linguaggio naturale sul codice caricato. Risposte ancorate ai file, con il tono e il livello che scegli.",
      intro: "La chat sul codice ti permette di interrogare un file o un repo intero come se parlassi con un collega.",
      byLevel: {
        beginner: {
          whatItIs: "Una chat che conosce il tuo progetto e risponde citando i file.",
          whyUseful: "Esplori il codice senza dover sapere dove guardare.",
          howDecoderImplements: "Decoder costruisce un contesto dal tuo upload e lo passa al provider AI scelto (BYOK o locale).",
          whenToUse: "Per onboarding, audit veloci o domande tipo 'dove viene chiamato X?'.",
          whenNotToUse: "Per modifiche destruttive: la chat spiega, non commitda.",
          practicalExample: "Chiedi 'cosa fa questo script?' e Decoder risponde citando le righe rilevanti.",
        },
      },
      faq: [
        { q: "Serve una chiave?", a: "Sì, oppure un modello locale. La chat usa un LLM, non regole statiche." },
        { q: "Le conversazioni vengono salvate?", a: "Solo nel tuo account, e le puoi ripescare dallo storico." },
      ],
      glossary: [{ term: "Contesto", definition: "Insieme di file e snippet passati all'LLM per rispondere alla domanda." }],
      cta: { label: "Apri una chat", href: "/" },
    },
    zh: {
      title: "与代码对话",
      metaTitle: "与代码对话 — Decoder",
      metaDescription:
        "用自然语言提问你上传的代码,答案锚定到文件,语气与深度由你选择。",
      intro: "代码聊天让你像与同事交流一样向单个文件或整个仓库提问。",
      byLevel: {
        beginner: {
          whatItIs: "一个了解你项目并能引用文件作答的聊天。",
          whyUseful: "无需知道从哪看起即可探索代码。",
          howDecoderImplements: "Decoder 从上传内容构建上下文,交给你选择的 AI 提供商(BYOK 或本地)。",
          whenToUse: "新人入门、快速审计或问 X 在哪里被调用。",
          whenNotToUse: "破坏性更改;聊天只解释、不提交。",
          practicalExample: "问 这个脚本干什么? ,Decoder 会引用相关行作答。",
        },
      },
      faq: [{ q: "需要密钥吗?", a: "需要,或使用本地模型。聊天依赖 LLM。" }],
      glossary: [{ term: "上下文", definition: "传给 LLM 用以作答的文件与片段集合。" }],
      cta: { label: "打开聊天", href: "/" },
    },
  },

  "ai-origin-detection": {
    it: {
      title: "Rilevamento origine AI",
      metaTitle: "Rilevamento origine AI — Decoder",
      metaDescription:
        "Capisci se uno snippet di codice è probabilmente generato da AI. Segnali statistici più verbalizzazione opzionale.",
      intro:
        "Decoder analizza segnali stilistici e strutturali per stimare se un pezzo di codice è stato scritto da un umano o da un LLM.",
      byLevel: {
        beginner: {
          whatItIs: "Un controllo che dice quanto è probabile che il codice arrivi da un AI generativo.",
          whyUseful: "Utile in code review, didattica o triage di codice sospetto.",
          howDecoderImplements: "Modello statistico locale + verbalizzazione AI opzionale (BYOK) per spiegare i segnali.",
          whenToUse: "Per orientarsi prima di approvare una PR di provenienza ignota.",
          whenNotToUse: "Come prova legale: è un'indicazione, non una sentenza.",
          practicalExample: "Incolli una funzione, Decoder restituisce uno score 0–100 e i segnali principali.",
        },
      },
      faq: [{ q: "È preciso?", a: "Indicativo: gli LLM moderni imitano gli umani molto bene. Usa il risultato come uno dei segnali, non come verità." }],
      glossary: [{ term: "LLM", definition: "Large Language Model — modello AI generativo di testo o codice." }],
      cta: { label: "Verifica un file", href: "/" },
    },
    zh: {
      title: "AI 来源识别",
      metaTitle: "AI 来源识别 — Decoder",
      metaDescription: "判断代码片段是否可能由 AI 生成。基于统计信号,可选 AI 解读。",
      intro: "Decoder 通过风格与结构信号估计代码是人写的还是 LLM 写的。",
      byLevel: {
        beginner: {
          whatItIs: "评估代码出自生成式 AI 概率的检查。",
          whyUseful: "代码评审、教学或可疑代码分诊时很有用。",
          howDecoderImplements: "本地统计模型 + 可选的 BYOK AI 解释信号。",
          whenToUse: "在批准来源不明的 PR 前。",
          whenNotToUse: "作为法律证据;这只是参考,不是定论。",
          practicalExample: "粘贴一个函数,Decoder 返回 0–100 的分值与主要信号。",
        },
      },
      faq: [{ q: "准确吗?", a: "仅作参考。现代 LLM 模仿能力很强。" }],
      glossary: [{ term: "LLM", definition: "大语言模型 — 生成式文本/代码 AI。" }],
      cta: { label: "检查一个文件", href: "/" },
    },
  },

  "zip-analysis": {
    it: {
      title: "Analisi di archivi ZIP",
      metaTitle: "Analisi ZIP — Decoder",
      metaDescription:
        "Carica un .zip: Decoder lo estrae in sicurezza (anti zip-slip, limiti dimensione) e analizza ogni file.",
      intro: "Lo ZIP è il modo più semplice di passare un progetto a Decoder, anche per file singoli (vengono impacchettati lato client).",
      byLevel: {
        beginner: {
          whatItIs: "Decoder apre il tuo archivio e tratta ogni file come se l'avessi caricato uno a uno.",
          whyUseful: "Un solo upload per un intero progetto.",
          howDecoderImplements: "Estrazione in sandbox con controlli anti zip-slip e tetto massimo di dimensione.",
          whenToUse: "Sempre, per repo o cartelle di più file.",
          whenNotToUse: "Per file singoli puoi anche fare drag-and-drop diretto.",
          practicalExample: "Carichi project.zip da 5 MB, Decoder lo apre e mostra l'albero dei file analizzati.",
        },
      },
      faq: [{ q: "C'è un limite di dimensione?", a: "Sì, per protezione: archivi troppo grandi vengono rifiutati con un messaggio chiaro." }],
      glossary: [
        { term: "Zip-slip", definition: "Attacco in cui un archivio scrive file fuori dalla cartella di estrazione." },
      ],
      cta: { label: "Carica uno ZIP", href: "/" },
    },
    zh: {
      title: "ZIP 归档分析",
      metaTitle: "ZIP 分析 — Decoder",
      metaDescription: "上传 .zip,Decoder 安全解压(防 zip-slip、大小上限)并分析每个文件。",
      intro: "ZIP 是把项目交给 Decoder 最简单的方式,单文件也会在客户端自动打包。",
      byLevel: {
        beginner: {
          whatItIs: "Decoder 打开你的归档并把每个文件当作单独上传处理。",
          whyUseful: "一次上传搞定整个项目。",
          howDecoderImplements: "沙箱解压,带 zip-slip 防护与大小上限。",
          whenToUse: "多文件仓库或目录时。",
          whenNotToUse: "单文件可直接拖拽。",
          practicalExample: "上传 5MB 的 project.zip,Decoder 即可显示分析后的文件树。",
        },
      },
      faq: [{ q: "有大小限制吗?", a: "有,出于保护,过大归档会被明确拒绝。" }],
      glossary: [{ term: "Zip-slip", definition: "归档将文件写到解压目录之外的攻击。" }],
      cta: { label: "上传 ZIP", href: "/" },
    },
  },

  sast: {
    it: {
      title: "SAST — Static Application Security Testing",
      metaTitle: "SAST — Decoder",
      metaDescription:
        "Analisi di sicurezza statica del codice sorgente: trova vulnerabilità senza eseguirlo.",
      intro: "SAST è la disciplina di trovare vulnerabilità leggendo il codice. Decoder offre uno SAST leggero, esplicabile e gratuito.",
      byLevel: {
        dev: {
          whatItIs: "Insieme di regole e analisi che leggono il sorgente per individuare pattern insicuri.",
          whyUseful: "Trovi problemi prima del deploy, senza dover eseguire l'applicazione.",
          howDecoderImplements: "Pattern multi-linguaggio, mapping CWE, scoring di severità, output ricco di contesto.",
          whenToUse: "In ogni triage, code review o audit di un progetto sconosciuto.",
          whenNotToUse: "Per bug runtime o problemi di concorrenza: lì serve DAST o test.",
          practicalExample: "Decoder segnala una SQL injection in un endpoint Express con riga, CWE e suggerimento.",
        },
      },
      faq: [{ q: "Sostituisce un SAST enterprise?", a: "Copre il caso quotidiano: per stack enterprise complessi resta utile uno strumento dedicato." }],
      glossary: [{ term: "CWE", definition: "Common Weakness Enumeration — tassonomia standard di debolezze software." }],
      cta: { label: "Esegui uno SAST", href: "/" },
    },
    zh: {
      title: "SAST — 静态应用安全测试",
      metaTitle: "SAST — Decoder",
      metaDescription: "源代码静态安全分析:不运行就能发现漏洞。",
      intro: "SAST 通过阅读代码发现漏洞。Decoder 提供轻量、可解释、免费的 SAST。",
      byLevel: {
        dev: {
          whatItIs: "用一系列规则与分析读取源码,找出不安全的模式。",
          whyUseful: "无需运行即可在部署前发现问题。",
          howDecoderImplements: "多语言模式、CWE 映射、严重度评分,输出带上下文。",
          whenToUse: "任何分诊、评审或对未知项目的审计。",
          whenNotToUse: "运行时缺陷或并发问题需 DAST 或测试。",
          practicalExample: "Decoder 在 Express 端点指出 SQL 注入,带行号、CWE 与建议。",
        },
      },
      faq: [{ q: "能替代企业 SAST 吗?", a: "覆盖日常场景;复杂企业栈仍建议专用工具。" }],
      glossary: [{ term: "CWE", definition: "通用弱点枚举,软件弱点的标准分类。" }],
      cta: { label: "运行 SAST", href: "/" },
    },
  },

  "secret-detection": {
    it: {
      title: "Rilevamento di segreti",
      metaTitle: "Rilevamento segreti nel codice — Decoder",
      metaDescription: "Trova chiavi API, token e credenziali finiti per errore nel codice sorgente.",
      intro: "Decoder cerca pattern noti e stringhe ad alta entropia che assomigliano a chiavi o token.",
      byLevel: {
        dev: {
          whatItIs: "Scansione che combina regex su prefissi noti (AKIA, ghp_, sk-...) e analisi entropica.",
          whyUseful: "Segreti committati per errore sono una delle cause principali di data breach.",
          howDecoderImplements: "Regole versionate + euristiche su entropia, con dedup e contesto della riga.",
          whenToUse: "Prima di rendere pubblico un repo o dopo un merge sospetto.",
          whenNotToUse: "Come sostituto di un secret manager runtime.",
          practicalExample: "Carichi un repo, Decoder evidenzia un AKIA hardcoded in scripts/deploy.sh.",
        },
      },
      faq: [{ q: "Cosa faccio se trovo un segreto?", a: "Revoca subito, ruota la chiave e riscrivi la storia git." }],
      glossary: [{ term: "Entropia", definition: "Misura di casualità — segreti reali hanno entropia alta." }],
      cta: { label: "Cerca segreti", href: "/" },
    },
    zh: {
      title: "密钥检测",
      metaTitle: "代码中的密钥检测 — Decoder",
      metaDescription: "查找误入源代码的 API 密钥、令牌与凭据。",
      intro: "Decoder 通过已知前缀正则与高熵字符串识别疑似密钥。",
      byLevel: {
        dev: {
          whatItIs: "结合已知前缀(AKIA、ghp_、sk-)正则与熵分析的扫描。",
          whyUseful: "误提交密钥是数据泄露的主要原因之一。",
          howDecoderImplements: "版本化规则 + 熵启发,去重并给出所在行上下文。",
          whenToUse: "公开仓库前或可疑合并后。",
          whenNotToUse: "替代运行时的密钥管理器。",
          practicalExample: "上传仓库后,Decoder 在 scripts/deploy.sh 中发现硬编码 AKIA。",
        },
      },
      faq: [{ q: "发现密钥后怎么办?", a: "立刻吊销、轮换并重写 git 历史。" }],
      glossary: [{ term: "熵", definition: "随机性度量,真实密钥熵高。" }],
      cta: { label: "扫描密钥", href: "/" },
    },
  },

  "cwe-mapping": {
    it: {
      title: "Mapping CWE",
      metaTitle: "Mapping CWE — Decoder",
      metaDescription:
        "Ogni vulnerabilità segnalata da Decoder è collegata a un identificatore CWE per categoria e severità.",
      intro: "Il CWE è la lingua comune della sicurezza del software: Decoder lo usa per rendere ogni finding confrontabile.",
      byLevel: {
        dev: {
          whatItIs: "Associazione tra finding e categoria CWE (es. CWE-89 per SQL injection).",
          whyUseful: "Permette di confrontare e prioritizzare i finding in modo standardizzato.",
          howDecoderImplements: "Ogni regola statica espone il CWE corrispondente; la UI lo mostra accanto al titolo.",
          whenToUse: "Quando bisogna comunicare il rischio a team di sicurezza o auditor.",
          whenNotToUse: "Quando il finding è puramente di qualità senza implicazioni di sicurezza.",
          practicalExample: "Decoder segnala 'Hardcoded credential — CWE-798' e linka al riferimento ufficiale.",
        },
      },
      faq: [{ q: "Quali CWE coprite?", a: "Le top-25 più diffuse e altre rilevanti per i linguaggi supportati." }],
      glossary: [{ term: "CWE", definition: "Common Weakness Enumeration — tassonomia delle debolezze software." }],
      cta: { label: "Vedi un report", href: "/" },
    },
    zh: {
      title: "CWE 映射",
      metaTitle: "CWE 映射 — Decoder",
      metaDescription: "Decoder 报告的每个漏洞都关联到 CWE 标识,用于分类与定级。",
      intro: "CWE 是软件安全的通用语言,Decoder 用它使每个 finding 可比较。",
      byLevel: {
        dev: {
          whatItIs: "把 finding 关联到 CWE 类别(如 CWE-89 表示 SQL 注入)。",
          whyUseful: "可标准化地比较与排序 finding。",
          howDecoderImplements: "每条静态规则携带 CWE,UI 在标题旁展示。",
          whenToUse: "向安全团队或审计沟通风险时。",
          whenNotToUse: "仅是代码质量、无安全含义的发现。",
          practicalExample: "Decoder 标记 Hardcoded credential — CWE-798 并链接到官方参考。",
        },
      },
      faq: [{ q: "覆盖哪些 CWE?", a: "最常见的 Top-25 及所支持语言相关条目。" }],
      glossary: [{ term: "CWE", definition: "通用弱点枚举,软件弱点的标准分类。" }],
      cta: { label: "查看报告", href: "/" },
    },
  },

  "supply-chain-security": {
    it: {
      title: "Sicurezza della supply chain",
      metaTitle: "Sicurezza supply chain del software — Decoder",
      metaDescription:
        "Analisi delle dipendenze e dei package sospetti: typosquatting, install script malevoli, autori cambiati.",
      intro:
        "La supply chain è dove un attaccante moderno ti colpisce: dipendenze, script di installazione, pacchetti trasferiti di mano.",
      byLevel: {
        dev: {
          whatItIs: "Insieme di controlli sulle dipendenze del tuo progetto (package.json, requirements.txt, ecc.).",
          whyUseful: "Una sola dipendenza compromessa basta a bucare tutto.",
          howDecoderImplements: "Parsing dei manifest, segnali su install script, typosquatting e versioni note vulnerabili.",
          whenToUse: "Prima di accettare una PR che aggiunge dipendenze, o periodicamente.",
          whenNotToUse: "Come unico controllo: complementare a SBOM e signature verification.",
          practicalExample: "Decoder evidenzia un package npm con install script che scarica un binario remoto.",
        },
      },
      faq: [{ q: "Generate uno SBOM?", a: "Non oggi: ci concentriamo sui segnali a rischio immediato." }],
      glossary: [
        { term: "Typosquatting", definition: "Pacchetti con nomi simili a librerie famose, pubblicati per ingannare." },
        { term: "SBOM", definition: "Software Bill of Materials — inventario delle dipendenze." },
      ],
      cta: { label: "Analizza le dipendenze", href: "/" },
    },
    zh: {
      title: "软件供应链安全",
      metaTitle: "软件供应链安全 — Decoder",
      metaDescription: "对依赖与可疑包进行分析:仿冒、恶意安装脚本、作者变更。",
      intro: "供应链是现代攻击的常见入口:依赖、安装脚本、易手的包。",
      byLevel: {
        dev: {
          whatItIs: "针对项目依赖清单(package.json、requirements.txt 等)的一组检查。",
          whyUseful: "一个被攻破的依赖即可击穿整体。",
          howDecoderImplements: "解析清单、识别安装脚本、仿冒命名与已知漏洞版本。",
          whenToUse: "合并新增依赖的 PR 前或周期性扫描。",
          whenNotToUse: "作为唯一手段;应与 SBOM、签名校验互补。",
          practicalExample: "Decoder 标记一个 npm 包,其安装脚本下载远程二进制。",
        },
      },
      faq: [{ q: "会生成 SBOM 吗?", a: "目前不,专注于即时风险信号。" }],
      glossary: [
        { term: "Typosquatting", definition: "用与知名库相似的名字发布欺骗性包。" },
        { term: "SBOM", definition: "软件物料清单,依赖的清单。" },
      ],
      cta: { label: "分析依赖", href: "/" },
    },
  },

  "eu-ai-act": {
    it: {
      title: "EU AI Act",
      metaTitle: "EU AI Act e analisi del codice — Decoder",
      metaDescription:
        "Cosa significa l'EU AI Act per chi sviluppa o usa strumenti AI sul codice. Decoder e i modelli ad alto rischio.",
      intro:
        "L'EU AI Act introduce obblighi differenziati a seconda del rischio del sistema AI. Decoder è pensato per restare in fascia bassa: nessun training sui tuoi dati, BYOK, opzione locale.",
      byLevel: {
        senior: {
          whatItIs: "Regolamento europeo che classifica i sistemi AI per livello di rischio e impone obblighi corrispondenti.",
          whyUseful: "Definisce chiaramente cosa serve fare per usare AI in modo conforme dentro l'UE.",
          howDecoderImplements: "Decoder non addestra modelli, non profila utenti, supporta inferenza locale e BYOK: configurabile per restare a basso rischio.",
          whenToUse: "Quando il tuo team valuta strumenti AI per code review in contesto regolato.",
          whenNotToUse: "Come consulenza legale: questa pagina è informativa, non sostituisce un avvocato.",
          practicalExample: "Una banca italiana adotta Decoder in modalità BYOK + audit trail per restare in fascia basso/limitato.",
        },
      },
      faq: [{ q: "Decoder è high-risk?", a: "No, è pensato per restare in fascia limited/minimal. Vedi /docs/eu-ai-act-code-analysis per il dettaglio." }],
      glossary: [{ term: "High-risk", definition: "Categoria AI Act con obblighi stringenti (gestione rischi, log, supervisione)." }],
      cta: { label: "Approfondisci", href: "/docs/eu-ai-act-code-analysis" },
    },
    zh: {
      title: "欧盟 AI 法案",
      metaTitle: "欧盟 AI 法案与代码分析 — Decoder",
      metaDescription:
        "对在代码上开发或使用 AI 工具者,欧盟 AI 法案意味着什么。Decoder 与高风险模型。",
      intro: "欧盟 AI 法案按风险等级对 AI 系统设义务。Decoder 设计为低风险:不训练你的数据、支持 BYOK 与本地推理。",
      byLevel: {
        senior: {
          whatItIs: "欧盟法规,按风险等级对 AI 系统分类并施加相应义务。",
          whyUseful: "明确在欧盟合规使用 AI 所需做的事。",
          howDecoderImplements: "不训练模型、不画像用户,支持本地推理与 BYOK,可配置为低风险。",
          whenToUse: "团队在受监管环境评估 AI 代码评审工具时。",
          whenNotToUse: "作为法律意见;本页仅为信息。",
          practicalExample: "一家意大利银行以 BYOK + 审计跟踪采用 Decoder,以保持有限/最低风险。",
        },
      },
      faq: [{ q: "Decoder 是高风险吗?", a: "不是。详见 /docs/zh/eu-ai-act-code-analysis。" }],
      glossary: [{ term: "高风险", definition: "AI 法案中带严格义务的类别。" }],
      cta: { label: "深入了解", href: "/docs/zh/eu-ai-act-code-analysis" },
    },
  },

  "gdpr-compliance": {
    it: {
      title: "Conformità GDPR",
      metaTitle: "GDPR e analisi del codice — Decoder",
      metaDescription:
        "Come Decoder gestisce dati personali, residenza dei dati e processori secondo il GDPR.",
      intro:
        "Il codice in sé non è quasi mai dato personale, ma può contenerne. Decoder tratta gli upload come dati riservati, BYOK isolato, log minimi.",
      byLevel: {
        senior: {
          whatItIs: "Regolamento UE su dati personali: principi di minimizzazione, liceità, sicurezza, accountability.",
          whyUseful: "Definisce cosa puoi inviare a un servizio terzo e come deve trattarlo.",
          howDecoderImplements: "Upload non persistiti oltre la sessione, BYOK cifrato, nessun training, ruoli admin tracciati.",
          whenToUse: "Quando il codice può contenere PII o commenti con dati personali.",
          whenNotToUse: "Come unico controllo: serve anche una DPIA del tuo flusso.",
          practicalExample: "Un'azienda tedesca usa Decoder con chiave OpenAI EU residency e tiene gli upload in cartelle scope-limited.",
        },
      },
      faq: [{ q: "Dove vivono i dati?", a: "Sul backend Decoder (EU) per la sessione; le chiamate AI vanno al provider scelto via BYOK." }],
      glossary: [{ term: "PII", definition: "Personally Identifiable Information — dati che identificano una persona." }],
      cta: { label: "Approfondisci", href: "/docs/it/gdpr-revisione-codice-ai" },
    },
    zh: {
      title: "GDPR 合规",
      metaTitle: "GDPR 与代码分析 — Decoder",
      metaDescription: "Decoder 如何根据 GDPR 处理个人数据、数据驻留与处理者。",
      intro: "代码本身通常不是个人数据,但可能含有。Decoder 把上传视为敏感数据,BYOK 隔离,日志最小化。",
      byLevel: {
        senior: {
          whatItIs: "欧盟个人数据法规:最小化、合法性、安全与问责原则。",
          whyUseful: "明确可以向第三方发送什么、以及对方应如何处理。",
          howDecoderImplements: "上传仅会话期保留、BYOK 加密、不训练、管理员行为可审计。",
          whenToUse: "代码可能含 PII 或带个人数据的注释时。",
          whenNotToUse: "作为唯一保障;仍需进行 DPIA。",
          practicalExample: "德国公司使用具备欧盟数据驻留的 OpenAI 密钥并限定上传范围。",
        },
      },
      faq: [{ q: "数据存放在哪里?", a: "会话期间存于 Decoder 欧盟后端;AI 调用按 BYOK 走你选的提供商。" }],
      glossary: [{ term: "PII", definition: "可识别个人的信息。" }],
      cta: { label: "深入了解", href: "/docs/zh/gdpr-ai-code-review" },
    },
  },

  "obfuscation-detection": {
    it: {
      title: "Rilevamento di codice offuscato",
      metaTitle: "Rilevamento codice offuscato — Decoder",
      metaDescription:
        "Identifica codice offuscato: stringhe Base64 lunghe, eval dinamici, nomi senza senso, alta entropia.",
      intro: "L'offuscamento è il modo più comune per nascondere malware nel codice apparentemente legittimo.",
      byLevel: {
        dev: {
          whatItIs: "Analisi che combina entropia, lunghezza media degli identificatori, presenza di eval/Function() e Base64 decode.",
          whyUseful: "Codice offuscato in librerie open source è quasi sempre un red flag.",
          howDecoderImplements: "Score di offuscamento per file con breakdown dei segnali contribuenti.",
          whenToUse: "Su tutto ciò che proviene da fonti non verificate (pastebin, fork sconosciuti).",
          whenNotToUse: "Su bundle minificati legittimi: l'output può sembrare offuscato.",
          practicalExample: "Decoder marca uno script npm post-install con score 0.92 e segnala eval(atob(...)).",
        },
      },
      faq: [{ q: "Minificato = offuscato?", a: "No, ma alcuni segnali si sovrappongono: leggi sempre il contesto." }],
      glossary: [{ term: "Eval", definition: "Funzione che esegue stringhe come codice — rischiosa se la stringa è dinamica." }],
      cta: { label: "Analizza un file", href: "/" },
    },
    zh: {
      title: "混淆代码检测",
      metaTitle: "混淆代码检测 — Decoder",
      metaDescription: "识别混淆代码:长 Base64 字符串、动态 eval、无意义命名、高熵。",
      intro: "混淆是把恶意代码藏在看似合法代码中最常见的手段。",
      byLevel: {
        dev: {
          whatItIs: "结合熵、标识符平均长度、eval/Function() 与 Base64 decode 的分析。",
          whyUseful: "开源库中的混淆代码几乎总是危险信号。",
          howDecoderImplements: "每文件给出混淆评分,并展示贡献信号细分。",
          whenToUse: "面对未经验证的来源(pastebin、未知 fork)。",
          whenNotToUse: "合法的压缩打包文件,其外观可能类似混淆。",
          practicalExample: "Decoder 给 npm post-install 脚本打 0.92 分,并指出 eval(atob(...))。",
        },
      },
      faq: [{ q: "压缩等于混淆吗?", a: "不等,但信号有重叠,需结合上下文。" }],
      glossary: [{ term: "Eval", definition: "把字符串作为代码执行的函数,动态字符串风险高。" }],
      cta: { label: "分析文件", href: "/" },
    },
  },

  "lockbit-case-study": {
    it: {
      title: "Case study: LockBit 3.0",
      metaTitle: "Case study LockBit 3.0 — Decoder",
      metaDescription:
        "Come Decoder ha analizzato i loader di LockBit 3.0: pattern statici, segnali malware, verbalizzazione AI.",
      intro:
        "LockBit 3.0 è una famiglia ransomware ad alto impatto. Questo case study mostra come Decoder ha disassemblato un loader pubblico e cosa ha trovato.",
      byLevel: {
        security: {
          whatItIs: "Analisi statica + AI di un loader LockBit 3.0 reso pubblico in incident report.",
          whyUseful: "Mostra come unire pattern deterministici e spiegazione AI per accorciare il triage.",
          howDecoderImplements: "Analisi statica → mapping CWE → verbalizzazione AI con BYOK del team.",
          whenToUse: "Come riferimento quando incontri loader simili.",
          whenNotToUse: "Per attribuzione: i pattern possono essere riutilizzati da altri gruppi.",
          practicalExample: "Decoder evidenzia il loader, segnala API Windows sospette e produce un riassunto leggibile in 30 secondi.",
        },
      },
      faq: [{ q: "Il codice è disponibile?", a: "No, riportiamo solo segnali e tecniche pubblicamente discusse." }],
      glossary: [{ term: "Loader", definition: "Stadio iniziale di un malware che scarica o decifra il payload reale." }],
      cta: { label: "Leggi il post", href: "/manifesto" },
    },
    zh: {
      title: "案例:LockBit 3.0",
      metaTitle: "LockBit 3.0 案例 — Decoder",
      metaDescription:
        "Decoder 如何分析 LockBit 3.0 loader:静态模式、恶意信号、AI 解读。",
      intro: "LockBit 3.0 是高影响勒索软件家族。本案例展示 Decoder 如何拆解一个公开 loader 并发现了什么。",
      byLevel: {
        security: {
          whatItIs: "对公开 incident 中的 LockBit 3.0 loader 做静态 + AI 分析。",
          whyUseful: "展示如何结合确定性模式与 AI 解释加速分诊。",
          howDecoderImplements: "静态分析 → CWE 映射 → 团队 BYOK AI 解读。",
          whenToUse: "遇到类似 loader 时作为参考。",
          whenNotToUse: "用于归因;模式可能被其他团伙复用。",
          practicalExample: "Decoder 指出可疑 Windows API,30 秒内产出可读摘要。",
        },
      },
      faq: [{ q: "提供代码吗?", a: "不;仅引用公开讨论的信号与技术。" }],
      glossary: [{ term: "Loader", definition: "恶意软件初始阶段,负责下载或解密真正的载荷。" }],
      cta: { label: "阅读文章", href: "/manifesto" },
    },
  },
};
