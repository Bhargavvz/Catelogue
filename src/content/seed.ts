import type { SiteContent } from "@/lib/types";

/**
 * The printed edition.
 *
 * Source of truth until Firestore has content, and the fallback forever after.
 *
 * Every figure here is traceable to the repository it describes — a training
 * report, a README results table, or the code itself. Where a repository states
 * no measurement, this file states none either. Claims that could not be
 * reproduced from source have been removed rather than rounded.
 */
export const seed: SiteContent = {
  profile: {
    name: "Adepu Vaatsava Sri Bhargav",
    shortName: "Bhargav Adepu",
    role: "Systems & ML Engineer",
    location: "Warangal, Telangana",
    email: "bhargavadepu@outlook.com",
    phone: "+91 9492909351",
    githubUser: "bhargavvz",
    github: "https://github.com/bhargavvz",
    linkedin: "https://linkedin.com/in/bhargavvz",
    resumeUrl: "/resume.pdf",
    lede: [
      "I write systems software and I train models. For five months in 2025 I worked inside VLC's C++ and Qt/QML codebase as a Google Summer of Code contributor at VideoLAN, building a recommendation engine that learns from playback behaviour.",
      "Most of the rest of my work sits at the same junction: a model that has to survive contact with a real deployment — behind an API, inside an app somebody actually opens, on a machine that costs money to keep running.",
      "I am finishing a B.Tech in Computer Science at CMR College of Engineering & Technology, graduating 2026. What follows is the catalogue. Every number in it is the number the repository reports, including the ones that are not flattering.",
    ],
  },

  experience: [
    {
      slug: "gsoc-videolan",
      org: "VideoLAN",
      role: "Google Summer of Code 2025 Contributor",
      period: "May – September 2025",
      location: "Remote",
      summary:
        "Designed and integrated a machine-learning recommendation module into VLC Media Player, personalising content suggestions from user playback behaviour.",
      detail: [
        "Selected to work on “AI-Powered Media Recommendation Engine for VLC” inside VideoLAN's C/C++ and Qt/QML codebase — a codebase measured in decades, not sprints.",
        "Built the recommendation module against playback history rather than metadata alone, so suggestions reflect what a person actually watches instead of what a file claims to be.",
        "Worked asynchronously with a distributed mentor team through Git-based review, upstream contribution standards, and CI gates. Nothing merged because I said it worked; it merged because the checks agreed.",
      ],
      stack: ["C", "C++", "Qt", "QML", "CMake", "GitLab", "Machine Learning"],
      links: [{ label: "VideoLAN", href: "https://videolan.org", kind: "live" }],
    },
  ],

  projects: [
    {
      slug: "aquasafe",
      no: 1,
      title: "AquaSafe",
      kicker: "Five models for waterborne disease risk, and what each one is worth",
      year: 2026,
      period: "November 2025 – present",
      status: "active",
      domain: "ml",
      featured: true,
      summary:
        "A mobile health platform that scores water safety, predicts waterborne disease, grades severity and estimates regional outbreak risk. Five specialised models behind one FastAPI service, consumed by a Flutter app on iOS, Android and web.",
      standfirst:
        "Waterborne disease in India is not an unsolved science problem. It is a timing problem: the data that would predict an outbreak exists, but it sits in separate registries and arrives after the fact. AquaSafe is an attempt to close that gap — and an honest account of which parts of the problem yielded and which did not.",
      metrics: [
        { label: "Water quality", value: "99.95%", note: "binary accuracy" },
        { label: "Severity grading", value: "92.73%", note: "4-class ordinal" },
        { label: "Disease prediction", value: "73.79%", note: "top-3 of 8 classes" },
        { label: "Outbreak risk", value: "R² 0.9496", note: "regression, RMSE 0.0746" },
      ],
      stack: [
        "Flutter",
        "FastAPI",
        "XGBoost",
        "LightGBM",
        "scikit-learn",
        "Python",
        "joblib",
      ],
      links: [
        { label: "Source", href: "https://github.com/bhargavvz/aquasafe", kind: "repo" },
        {
          label: "Hugging Face",
          href: "https://huggingface.co/bhargavvz/Aquasafe",
          kind: "model",
        },
      ],
      figures: [
        {
          id: "aqua-models",
          kind: "bars",
          unit: "%",
          max: 100,
          caption:
            "The five heads, ranked by how well they actually worked. Water quality is nearly solved; single-label disease attribution is not. Both are printed at the same size on purpose.",
          bars: [
            { label: "Water quality", value: 99.95, note: "binary" },
            { label: "Severity", value: 92.73, note: "4-class ordinal" },
            { label: "Disease, top-3", value: 73.79, note: "8 classes" },
            { label: "Disease, top-1", value: 42.46, note: "8 classes" },
          ],
        },
      ],
      body: [
        {
          t: "p",
          text: "AquaSafe analyses water chemistry, sanitation infrastructure and regional health data to answer four questions: is this water safe, what disease is this presentation most likely to be, how severe is this case, and how likely is an outbreak in this district. Each question is a separate model, because they are separate problems with separate error costs.",
        },
        { t: "h", text: "The dataset was the project" },
        {
          t: "p",
          text: "There is no public dataset joining water chemistry to disease incidence at district resolution in India. The training set is therefore synthetic — 500,000 records generated against real Indian epidemiological distributions, with 26 features spanning water chemistry, sanitation, climate, demographics and clinical symptoms. Total training time across all five models was 36 minutes.",
        },
        {
          t: "note",
          text: "Calibrated, not real. A synthetic distribution matching published marginals is a starting point for deployment, not a substitute for surveillance data — and it caps how much any of these numbers can be trusted in the field.",
        },
        { t: "figure", ref: "aqua-models" },
        { t: "h", text: "What worked" },
        {
          t: "p",
          text: "The water quality classifier reached 99.95% accuracy with an F1 of 0.9997, driven — unsurprisingly, and reassuringly — by pH, total coliform count, turbidity, TDS and E. coli. When a model's top features are exactly the ones a sanitary engineer would name, that is evidence the pipeline is wiring the right signal through rather than memorising an artefact of the generator.",
        },
        {
          t: "p",
          text: "Severity assessment, treated as an ordinal problem across Low/Medium/High/Critical, reached 92.73% exact accuracy and 98.16% adjacent accuracy — meaning it is almost never wrong by more than one grade, which is the error profile that matters for triage. Outbreak risk is a regression over a 0–1 range, scoring R² 0.9496 with an RMSE of 0.0746.",
        },
        { t: "h", text: "What did not" },
        {
          t: "p",
          text: "Single-label disease attribution across eight classes reached 42.46% top-1 accuracy, with a macro F1 of 0.2020. Top-3 accuracy was 73.79%. This is the weakest model in the set and the honest reading is that environmental features alone do not separate cholera from typhoid from giardiasis — the clinical presentations overlap, and the synthetic generator cannot invent a signal that the underlying epidemiology does not contain.",
        },
        {
          t: "p",
          text: "It also took by far the longest to train — 1,806 seconds against 17 for severity — which is the usual signature of a model straining against a problem rather than learning it. Presented as a top-3 shortlist for a health worker to narrow by symptom, 74% is useful. Presented as a diagnosis, 42% is not, and the application surfaces it as the former.",
        },
        {
          t: "quote",
          text: "The interesting output of this project is not the 99.95%. It is knowing precisely which of the five questions the data can answer and which it cannot.",
        },
        { t: "h", text: "Shipping it" },
        {
          t: "p",
          text: "All five models are exported to joblib and served behind a FastAPI service, with StandardScaler normalisation and median imputation applied identically at training and inference time. The client is a Flutter application targeting iOS, Android and web from one codebase. Inference has to feel instant on a mid-range Android phone over an unreliable connection, which is the requirement that made gradient-boosted trees the right answer over anything deeper.",
        },
      ],
      footnotes: [
        {
          id: "f1",
          text: "All figures from ML/export/reports/training_report.md in the repository, generated 2026-02-04 over 500,000 records.",
        },
      ],
    },

    {
      slug: "skinguard-ai",
      no: 2,
      title: "SkinGuard AI",
      kicker: "A three-backbone ensemble for dermoscopic lesion classification",
      year: 2026,
      period: "December 2025 – February 2026",
      status: "shipped",
      domain: "ml",
      featured: true,
      summary:
        "Eight-class skin lesion classification on ISIC 2019, built as an ensemble of three modern vision backbones and trained inside a seven-hour budget on a single H100.",
      standfirst:
        "Melanoma is the case where a false negative is measured in years of life. That asymmetry shapes every decision here — the loss function, the augmentation, the ensemble, and the insistence that the model show you where it looked.",
      metrics: [
        { label: "Dataset", value: "25,331", note: "ISIC 2019 dermoscopic images" },
        { label: "Classes", value: "8", note: "3 malignant, 1 pre-malignant" },
        { label: "Ensemble", value: "589M", note: "params across 3 backbones" },
        { label: "Training budget", value: "7 hr", note: "single NVIDIA H100" },
      ],
      stack: [
        "Python",
        "PyTorch",
        "EVA-02",
        "ConvNeXt-V2",
        "Swin-V2",
        "Grad-CAM",
        "ONNX",
        "Hugging Face",
      ],
      links: [
        { label: "Source", href: "https://github.com/bhargavvz/Skinn", kind: "repo" },
        {
          label: "Hugging Face",
          href: "https://huggingface.co/bhargavvz/SkinGuard-AI",
          kind: "model",
        },
      ],
      figures: [
        {
          id: "skin-ensemble",
          kind: "bars",
          unit: "M",
          max: 320,
          caption:
            "Three backbones chosen for disagreement rather than size: a transformer, a modernised convnet, and a windowed-attention hybrid. Ensembles work when members fail differently.",
          bars: [
            { label: "EVA-02-Large", value: 304, note: "transformer" },
            { label: "ConvNeXt-V2-Large", value: 198, note: "modern convnet" },
            { label: "Swin-V2-Base", value: 87, note: "shifted-window attention" },
          ],
        },
      ],
      body: [
        {
          t: "p",
          text: "SkinGuard AI classifies dermoscopic images into the eight ISIC 2019 lesion categories: melanoma, basal cell carcinoma and squamous cell carcinoma (malignant), actinic keratosis (pre-malignant), and melanocytic nevus, benign keratosis, dermatofibroma and vascular lesion (benign).",
        },
        { t: "h", text: "Why three models" },
        {
          t: "p",
          text: "The ensemble pairs EVA-02-Large, ConvNeXt-V2-Large and Swin-V2-Base — a pure transformer, a modernised convolutional network, and a shifted-window hybrid. They are not chosen for size but for architectural disagreement: an ensemble only earns its cost when its members make different mistakes, and three families with different inductive biases are more likely to fail independently than three checkpoints of the same design.",
        },
        { t: "figure", ref: "skin-ensemble" },
        { t: "h", text: "Fighting the class imbalance" },
        {
          t: "p",
          text: "ISIC 2019 is severely imbalanced — melanocytic nevi outnumber melanoma by roughly fifteen to one. Left alone, a model maximises accuracy by learning to say “benign”, which is precisely the failure mode that matters. Training therefore uses focal loss plus inverse-frequency class weighting, with MixUp and CutMix for batch-level regularisation, label smoothing at 0.1 for calibration, a five-epoch cosine warmup, gradient clipping at norm 1.0, and early stopping on validation AUROC rather than on accuracy.",
        },
        {
          t: "note",
          text: "Stopping on AUROC instead of accuracy is the single most consequential line in the training config. Accuracy would have rewarded the model for ignoring the malignant classes.",
        },
        { t: "h", text: "Fitting it into seven hours" },
        {
          t: "p",
          text: "The whole pipeline — download, training, evaluation, test-time augmentation, Grad-CAM and ONNX export — is budgeted for a single seven-hour H100 session. Getting there needed BF16 autocast, torch.compile in reduce-overhead mode, TF32 matmuls, an effective batch of 256 via 128 × 2 accumulation, and a dataloader tuned with sixteen workers, pinned memory and prefetching. Test-time augmentation adds a further one to two points at inference cost only.",
        },
        {
          t: "p",
          text: "Every prediction ships with a Grad-CAM overlay, and the trained ensemble exports to ONNX for deployment. The repository reports above 95% accuracy on the held-out split; I would want an independent evaluation set before repeating that anywhere it mattered.",
        },
      ],
    },

    {
      slug: "medgpt",
      no: 3,
      title: "MedGPT",
      kicker: "Knowledge-guided, explainable medical visual question answering",
      year: 2026,
      period: "December 2025 – January 2026",
      status: "active",
      domain: "ml",
      featured: true,
      summary:
        "A medical VQA system that answers natural-language questions about clinical images by fusing a vision encoder with retrieved biomedical knowledge — and exposes three independent explanations for every answer.",
      standfirst:
        "A model that gives a confident wrong answer about a chest X-ray is worse than no model. So the architecture here is organised around a different question than accuracy: can you see why it said that?",
      metrics: [
        { label: "Base model", value: "Qwen2-VL-7B", note: "4-bit QLoRA" },
        { label: "Training samples", value: "55,048", note: "4 public VQA sets" },
        { label: "Explainers", value: "3", note: "Grad-CAM, rollout, IG" },
        { label: "Modalities", value: "X-ray, CT, MRI, path." },
      ],
      stack: [
        "Python",
        "PyTorch",
        "Qwen2-VL",
        "LoRA / QLoRA",
        "BioBERT",
        "CLIP ViT",
        "FastAPI",
        "DeepSpeed",
        "Docker",
      ],
      links: [
        { label: "Source", href: "https://github.com/bhargavvz/MedGPT", kind: "repo" },
        {
          label: "Hugging Face",
          href: "https://huggingface.co/bhargavvz/MedGPT",
          kind: "model",
        },
      ],
      figures: [
        {
          id: "med-data",
          kind: "bars",
          unit: "",
          max: 34000,
          caption:
            "The four public VQA corpora harmonised into one schema. Pathology dominates by volume, which is a sampling bias the evaluation has to account for rather than benefit from.",
          bars: [
            { label: "PathVQA", value: 32799, note: "pathology" },
            { label: "SLAKE", value: 14028, note: "multi-modal" },
            { label: "MedVQA", value: 4706, note: "multi-modal" },
            { label: "VQA-RAD", value: 3515, note: "radiology" },
          ],
        },
      ],
      body: [
        {
          t: "p",
          text: "MedGPT is built on Qwen2-VL-7B, fine-tuned with LoRA under 4-bit quantisation so an 8B-class vision-language model can be adapted on a single GPU. Four public medical VQA corpora — PathVQA, SLAKE, MedVQA and VQA-RAD — are harmonised into one schema covering radiology, pathology and multi-modal imaging.",
        },
        { t: "h", text: "The knowledge path" },
        {
          t: "p",
          text: "What separates this from a general VLM pointed at medical images is a second encoder. Alongside the CLIP ViT vision path, a BioBERT/PubMedBERT encoder embeds domain knowledge retrieved through UMLS and SciSpacy, and a cross-attention fusion module combines the two before the answer head. The intent is that the model reasons with medical vocabulary rather than around it, and that its answers are anchored to retrievable statements rather than to correlations in the training images.",
        },
        { t: "figure", ref: "med-data" },
        { t: "h", text: "Three explanations, not one" },
        {
          t: "p",
          text: "Every answer carries Grad-CAM, attention rollout and integrated gradients. Three explainers rather than one because they can disagree, and disagreement is itself diagnostic — a Grad-CAM that highlights the lesion while integrated gradients points at the scanner annotation is a model that got the right answer for the wrong reason, and no single method would have caught it.",
        },
        {
          t: "note",
          text: "There is no headline accuracy on this page because the repository does not publish an evaluation run. The architecture is the claim; the number will go here when there is one to cite.",
        },
        {
          t: "p",
          text: "The pipeline handles DICOM conversion, medical-specific image augmentation and text preprocessing, trains through a custom multi-objective trainer with optional DeepSpeed, and serves through a FastAPI backend, containerised with GPU support.",
        },
      ],
    },

    {
      slug: "photonqr",
      no: 4,
      title: "PhotonQR",
      kicker: "Moving files across an air gap, one screenful at a time",
      year: 2026,
      period: "2026",
      status: "active",
      domain: "systems",
      featured: true,
      summary:
        "An optical file-transfer protocol. One phone animates QR frames, another films them, and bytes cross a gap with no network, no pairing and no radio — encrypted per packet and erasure-coded against dropped frames.",
      standfirst:
        "Every file transfer tool assumes a shared network. PhotonQR assumes the opposite: two devices that can see each other and nothing else. What comes back is a real protocol problem — framing, error correction, flow control — solved through a camera.",
      metrics: [
        { label: "Cipher", value: "AES-256-GCM", note: "header bound as AAD" },
        { label: "Erasure coding", value: "Reed–Solomon", note: "over GF(256)" },
        { label: "Throughput ceiling", value: "~4 KB/s", note: "QR v15 at 12 fps" },
        { label: "Network permission", value: "None", note: "no code path exists" },
      ],
      stack: ["Flutter", "Dart", "AES-256-GCM", "Reed–Solomon", "SHA-256", "GitHub Actions"],
      links: [{ label: "Source", href: "https://github.com/bhargavvz/PhotonQR", kind: "repo" }],
      body: [
        {
          t: "p",
          text: "The sender renders a file as a sequence of QR frames on screen; the receiver films them through its camera and reassembles the bytes. There is no pairing step, no shared network, and no radio involved — which means the transfer works in places where every other method is either unavailable or disallowed.",
        },
        { t: "h", text: "Honest about being slow" },
        {
          t: "p",
          text: "At QR version 15 and twelve frames per second the ceiling is roughly four kilobytes per second before losses. A 50 KB document takes about twenty seconds; a 3 MB photo takes about twenty minutes; a 200 MB video is not practical. The Send screen states the estimate before you begin, because a user who picks a large video without being warned will reasonably conclude the app is broken when it is still going an hour later.",
        },
        {
          t: "note",
          text: "Publishing your own throughput ceiling in the README is a design decision, not a disclaimer. It sets the tool's purpose: this is for data that needs to cross an air gap, not data in a hurry.",
        },
        { t: "h", text: "The protocol" },
        {
          t: "p",
          text: "Every packet is encrypted with AES-256-GCM, with the frame header bound in as associated data so a tampered header fails authentication rather than silently mis-routing a chunk. Reed–Solomon erasure coding over GF(256) means the receiver tolerates dropped and corrupted frames without a retransmit channel — which matters, because there is no back-channel to request one. The completed file is verified against the sender's SHA-256 digest before it is written.",
        },
        {
          t: "list",
          items: [
            "Any binary file — the protocol carries bytes, with no type restrictions.",
            "Automatic compression, skipped when it would not help: JPEG, MP4, ZIP and APK are detected and stored verbatim rather than expanded.",
            "Adaptive optimisation that diagnoses why throughput is low before changing anything.",
            "Resume across app restarts, so a long transfer survives being interrupted.",
            "Developer mode with a live protocol monitor.",
          ],
        },
        { t: "h", text: "No network permission at all" },
        {
          t: "p",
          text: "The application declares no network permission, and there is no code path that could use one. For a tool whose entire purpose is moving data without a network, that is the difference between a privacy claim and a structural guarantee: it cannot phone home, and you can verify that from the manifest rather than taking my word for it.",
        },
        {
          t: "p",
          text: "Built on Flutter 3.35.7 for Android API 24+ and iOS 12+, in a feature-first clean architecture with no circular dependencies, and wired to GitHub Actions for CI and releases.",
        },
      ],
    },

    {
      slug: "vaultlock",
      no: 5,
      title: "VaultLock",
      kicker: "A password manager that has nowhere to send your data",
      year: 2025,
      period: "October 2025 – present",
      status: "shipped",
      domain: "security",
      featured: true,
      summary:
        "A zero-knowledge, offline-first password manager. AES-256-GCM with PBKDF2-SHA256 key derivation, biometric unlock, and one Flutter codebase running on Android, iOS, Windows, macOS and Linux.",
      standfirst:
        "Every cloud password manager asks you to trust an infrastructure you cannot inspect with the one secret that unlocks everything else. VaultLock takes the opposite position: there is no server, so there is nothing to breach.",
      metrics: [
        { label: "Cipher", value: "AES-256-GCM", note: "authenticated" },
        { label: "Key derivation", value: "PBKDF2-SHA256", note: "10,000 iterations" },
        { label: "Platforms", value: "5", note: "one codebase" },
        { label: "Servers holding your vault", value: "0" },
      ],
      stack: [
        "Flutter",
        "Dart",
        "SQLite",
        "AES-256-GCM",
        "PBKDF2",
        "Next.js 14",
        "TypeScript",
        "Framer Motion",
      ],
      links: [
        { label: "Live", href: "https://vaultlock.adepu.co.in/", kind: "live" },
        { label: "App source", href: "https://github.com/bhargavvz/VaultLock", kind: "repo" },
        { label: "Web source", href: "https://github.com/bhargavvz/VaultLock-Web", kind: "repo" },
      ],
      body: [
        {
          t: "p",
          text: "VaultLock gives people full ownership of their credentials: no cloud dependency, no third-party servers holding passwords, just a private vault that is genuinely theirs.",
        },
        { t: "h", text: "The cryptography" },
        {
          t: "p",
          text: "Entries are encrypted with AES-256-GCM, which authenticates as well as encrypts — a tampered ciphertext fails to decrypt rather than silently producing garbage. The vault key is derived from the master password with PBKDF2-SHA256 over 10,000 iterations. There is no account, no sync endpoint and no recovery email, and that last point is a deliberate trade: lose the master password and the vault is gone, because any recovery path I could build would also be a path in.",
        },
        {
          t: "note",
          text: "Zero-knowledge is easy to claim and easy to check: if the code has no network path for vault data, the claim holds by construction rather than by policy.",
        },
        { t: "h", text: "One codebase, five platforms" },
        {
          t: "p",
          text: "VaultLock runs on Android, iOS, Windows, macOS and Linux from a single Flutter codebase, so the security guarantees are identical everywhere — which matters more for a security tool than for most apps, because it means there is one implementation to audit rather than five. Biometric authentication sits in front of the vault, alongside a password-security audit that scores strength in real time.",
        },
        {
          t: "p",
          text: "The companion site is a separate Next.js 14 project in TypeScript and Tailwind, with Framer Motion transitions, a security-focused feature breakdown, a walkthrough of how the encryption works, and a download centre. Building the product and building the case for the product are different skills, and I wanted both on the record.",
        },
      ],
    },

    {
      slug: "communitfx",
      no: 6,
      title: "Communitfx",
      kicker: "Civic issue reporting, geo-tagged and public",
      year: 2024,
      period: "June 2024 – present",
      status: "shipped",
      domain: "product",
      featured: true,
      summary:
        "A civic engagement platform giving citizens a direct, transparent route to report potholes, garbage dumping, broken streetlights and drainage leaks — and to watch what happens next. Spring Boot behind a React client.",
      standfirst:
        "The problem with reporting a pothole is not the reporting. It is that the report vanishes. Communitfx makes the queue visible, which turns out to be the part that changes behaviour.",
      metrics: [
        { label: "GitHub stars", value: "16", note: "most-starred repository" },
        { label: "Recognition", value: "SDG 11", note: "Honorable Mention, IIT Hyderabad" },
        { label: "Backend", value: "Spring Boot", note: "HikariCP pooling" },
        { label: "Field", value: "Geospatial", note: "Leaflet + Mapbox GL" },
      ],
      stack: [
        "React",
        "TypeScript",
        "Spring Boot",
        "Java",
        "PostgreSQL",
        "HikariCP",
        "Leaflet",
        "Mapbox GL",
        "Docker",
      ],
      links: [
        { label: "Source", href: "https://github.com/bhargavvz/Communitfx", kind: "repo" },
      ],
      body: [
        {
          t: "p",
          text: "Communitfx — also known as CoFix — is a civic engagement platform built to give citizens a direct and transparent way to report everyday urban problems, instead of those issues going unnoticed or unresolved. It was built by a team of student developers from CMR College of Engineering & Technology.",
        },
        { t: "h", text: "How it is put together" },
        {
          t: "p",
          text: "The backend is a Spring Boot service in Java with a domain model of users, posts, reviews, locations and benefit types, backed by PostgreSQL through HikariCP connection pooling and a custom physical naming strategy to keep the schema conventions consistent. The frontend is React and TypeScript with a component library built for the reporting flow — issue category selection, dashboard and auth layouts, and map views.",
        },
        {
          t: "list",
          items: [
            "Geo-tagged issue reporting with photo uploads, so authorities see exactly where and what the problem is.",
            "An interactive, colour-coded map built with Leaflet and Mapbox GL showing issue density and resolution status across a locality.",
            "Real-time status tracking, so a citizen can follow a report from submitted to resolved.",
            "A direct communication channel between residents and local authorities.",
            "An integrated chatbot to help users navigate reporting and get quick answers.",
          ],
        },
        {
          t: "note",
          text: "Communitfx received an Honorable Mention in the SDG 11: Sustainable Cities and Communities track at Hack4SDG, organised by IIT Hyderabad, among more than 200 competing projects.",
        },
        {
          t: "p",
          text: "It is the most-starred repository I have written, and it later evolved into CoFix v3.0 on a more scalable architecture.",
        },
        {
          t: "quote",
          text: "Communitfx reflects a belief that well-designed, citizen-first tools can make local governance more responsive and cities more liveable.",
        },
      ],
    },

    {
      slug: "fingerprint-blood-group",
      no: 7,
      title: "Fingerprint Blood Group Detection",
      kicker: "EfficientNet-B3 with CBAM attention, eight classes",
      year: 2025,
      period: "February – March 2025",
      status: "shipped",
      domain: "ml",
      featured: false,
      summary:
        "Predicting blood group from a fingerprint image — an attempt to make screening faster and cheaper than lab serology, with Grad-CAM so the prediction is not a black box.",
      metrics: [
        { label: "Accuracy", value: "94.67%", note: "8 blood groups" },
        { label: "Macro F1", value: "93.94%" },
        { label: "Macro recall", value: "94.18%" },
        { label: "Hardware", value: "2× T4", note: "multi-GPU, Ubuntu 24.04" },
      ],
      stack: [
        "Python",
        "PyTorch",
        "EfficientNet-B3",
        "CBAM",
        "Grad-CAM",
        "FastAPI",
        "React",
        "Git LFS",
      ],
      links: [
        { label: "Source", href: "https://github.com/bhargavvz/Fingerprint", kind: "repo" },
      ],
      figures: [
        {
          id: "fp-metrics",
          kind: "bars",
          unit: "%",
          max: 100,
          caption:
            "Held-out performance across all eight blood-group classes. Macro averaging is the honest metric here — the dataset is imbalanced, and plain accuracy would flatter the majority classes.",
          bars: [
            { label: "Accuracy", value: 94.67 },
            { label: "Macro recall", value: 94.18 },
            { label: "Macro F1", value: 93.94 },
            { label: "Macro precision", value: 93.82 },
          ],
        },
      ],
      body: [
        {
          t: "p",
          text: "An EfficientNet-B3 backbone enhanced with CBAM — a Convolutional Block Attention Module — giving dual channel-and-spatial attention so the network concentrates on discriminative ridge and pattern features rather than the whole frame.",
        },
        { t: "figure", ref: "fp-metrics" },
        { t: "h", text: "Handling the imbalance" },
        {
          t: "p",
          text: "Blood groups are not evenly distributed, and neither was the dataset. Training uses focal loss to stop majority classes dominating the gradient, plus MixUp and CutMix augmentation. Grad-CAM makes a prediction interpretable rather than a black box — which, for anything touching a clinical decision, is the difference between a demo and a tool.",
        },
        {
          t: "p",
          text: "Training ran on two NVIDIA T4s under Ubuntu 24.04, with checkpoints versioned through Git LFS and the run emitting training curves, an 8×8 confusion matrix, per-class ROC curves and per-class precision/recall/F1. It is productionised behind a FastAPI service with a React and Tailwind frontend.",
        },
        {
          t: "note",
          text: "The repository carries an explicit disclaimer: research and educational purposes only. Blood group determination for any medical decision must be done by certified laboratory professionals.",
        },
        {
          t: "p",
          text: "Built at CMR College of Engineering & Technology under the guidance of Dr. P. Senthil, alongside D. Saketh Reddy, G. Surya Kiran and G. Bhavana Reddy.",
        },
      ],
    },

    {
      slug: "pharmacare",
      no: 8,
      title: "PharmaCare",
      kicker: "Medication management with a donation pipeline for unused stock",
      year: 2025,
      period: "April 2025 – present",
      status: "shipped",
      domain: "product",
      featured: false,
      summary:
        "A medication management platform solving two connected problems: helping people stay on top of their prescriptions, and routing unused, unexpired medicine to someone who needs it instead of a bin.",
      metrics: [
        { label: "Backend", value: "Spring Boot 3", note: "Java 17" },
        { label: "Auth", value: "JWT + OAuth2", note: "Spring Security, Google" },
        { label: "API docs", value: "OpenAPI", note: "Swagger UI" },
        { label: "Roles", value: "User + pharmacy", note: "separate portals" },
      ],
      stack: [
        "React",
        "Vite",
        "TypeScript",
        "Tailwind CSS",
        "Spring Boot 3",
        "Java 17",
        "PostgreSQL",
        "Spring Security",
        "Maven",
      ],
      links: [
        { label: "Source", href: "https://github.com/bhargavvz/PharmaCare-V3", kind: "repo" },
      ],
      body: [
        {
          t: "p",
          text: "PharmaCare is a full-stack medication management platform: a Spring Boot 3 backend on Java 17, a React and TypeScript frontend built with Vite and Tailwind, and PostgreSQL underneath.",
        },
        { t: "h", text: "Two problems, one system" },
        {
          t: "p",
          text: "Users add and track medications with dosage and frequency schedules, set customisable reminders, and view an adherence dashboard. A rewards system gives points and achievements for consistent adherence. For families, PharmaCare supports adding members with permission-based access, so a caregiver can manage medications and reminders for the people they look after.",
        },
        {
          t: "p",
          text: "The standout feature is the donation system. Users list unused, unexpired medications for donation, and pharmacies get a dedicated portal to review, accept or reject donations and track statistics — turning what would otherwise be wasted medicine into a resource for someone who needs it. That requires two distinct role-based interfaces over one dataset, which is where most of the authorisation complexity lives.",
        },
        { t: "h", text: "Auth and API surface" },
        {
          t: "p",
          text: "Authentication runs through Spring Security with JWT plus Google OAuth2, and the REST API is fully documented with Swagger and OpenAPI. Configuration is split so that secrets — database credentials, JWT signing key, OAuth client secret, SMTP password — are supplied by environment variables or a gitignored local properties file rather than committed, which is the kind of thing that is boring to do and expensive to skip.",
        },
      ],
    },

    {
      slug: "software-cost-estimation",
      no: 9,
      title: "Ultra-Scale Software Cost Estimation",
      kicker: "Sprint-level effort prediction as a temporal modelling problem",
      year: 2025,
      period: "February – March 2025",
      status: "research",
      domain: "ml",
      featured: false,
      summary:
        "A research-grade deep learning system for predicting Agile development effort and cost — modelling sprint-level temporal behaviour instead of averaging story points.",
      metrics: [
        { label: "Data quality pipeline", value: "7 stages", note: "with audit trail" },
        { label: "Architectures", value: "4", note: "compared head to head" },
        { label: "Target hardware", value: "H200 SXM", note: "141 GB HBM3e, BF16" },
        { label: "Data sources", value: "4", note: "ISBSG, PROMISE, NASA, synthetic" },
      ],
      stack: [
        "Python",
        "PyTorch",
        "XGBoost",
        "BiLSTM",
        "Transformers",
        "SHAP",
        "torch.compile",
      ],
      links: [
        {
          label: "Source",
          href: "https://github.com/bhargavvz/Software-Cost-Estimation",
          kind: "repo",
        },
      ],
      body: [
        {
          t: "p",
          text: "Most software cost estimation treats story points as a static average. This project treats estimation as what it actually is — a temporal problem, where a team's velocity drifts, scope creeps, and failed sprints carry information forward.",
        },
        { t: "h", text: "Data quality as a first-class stage" },
        {
          t: "p",
          text: "Four sources — the ISBSG and PROMISE project datasets, NASA effort data, and a custom synthetic Agile sprint simulator modelling team learning curves, velocity drift, scope creep and sprint failures — are pulled through a schema harmoniser into one canonical form. Then comes a seven-stage quality pipeline: missing-data imputation, outlier detection by IQR and Isolation Forest, Agile-consistency checks, Kalman-filter temporal smoothing, feature selection, label QA, and SHA-based data versioning with a full audit trail.",
        },
        {
          t: "note",
          text: "Most of the engineering effort here went into the seven stages before the model. That is the correct ratio for a data-centric problem, and rarely the fun one.",
        },
        {
          t: "p",
          text: "Four architectures are then compared on identical data: an XGBoost and Random Forest baseline, a deep BiLSTM with attention, a large Transformer encoder, and a CNN-Transformer hybrid. Training is engineered for an NVIDIA H200 SXM with BF16 mixed precision, gradient accumulation, OneCycleLR with warmup, gradient clipping, curriculum learning and early stopping. Evaluation reports MAE, RMSE, MAPE and R², with attention heatmaps, SHAP values and an ablation study for interpretation.",
        },
      ],
    },

    {
      slug: "flashcard-engine",
      no: 10,
      title: "FlashCard-Engine",
      kicker: "A real spaced-repetition scheduler, not a flashcard app",
      year: 2025,
      period: "April 2025",
      status: "shipped",
      domain: "product",
      featured: false,
      summary:
        "Turns any PDF into a practice deck, then schedules the review with a full FSRS v4.5 implementation — the same memory model Anki moved to, written from the paper rather than imported.",
      standfirst:
        "Generating flashcards from a document is the easy half. The half that decides whether anyone learns anything is when you show each card again, and that is a memory-model problem.",
      metrics: [
        { label: "Scheduler", value: "FSRS v4.5", note: "17 parameters, from scratch" },
        { label: "Card states", value: "4", note: "new, learning, review, relearning" },
        { label: "Generation", value: "PyMuPDF + Groq", note: "PDF to deck" },
        { label: "Deployment", value: "systemd + nginx" },
      ],
      stack: [
        "FastAPI",
        "Python",
        "SQLAlchemy 2",
        "PostgreSQL",
        "Groq",
        "PyMuPDF",
        "React",
        "JWT",
        "nginx",
      ],
      links: [
        {
          label: "Source",
          href: "https://github.com/bhargavvz/FlashCard-Engine",
          kind: "repo",
        },
      ],
      body: [
        {
          t: "p",
          text: "Drop in a PDF — a chapter on quadratic equations, lecture notes on the French Revolution — and get back a structured deck. PyMuPDF extracts and segments the text, and a Groq-hosted model turns it into question-and-answer pairs, so learners go straight from raw notes to active recall instead of spending an evening transcribing.",
        },
        { t: "h", text: "The part that matters" },
        {
          t: "p",
          text: "The scheduling is a from-scratch implementation of FSRS v4.5, the Free Spaced Repetition Scheduler. It models each card with a stability and a difficulty, tracks four states — new, learning, review and relearning — and updates them from a four-point rating of again, hard, good or easy, using the full seventeen-weight parameter set. That is a genuine memory model with retrievability decay, not the fixed multiplier interval that most flashcard apps ship.",
        },
        {
          t: "note",
          text: "Implementing FSRS rather than importing a library is the difference between a project that uses spaced repetition and one that understands it. The parameter comments in that file are the study notes.",
        },
        { t: "h", text: "The rest of the system" },
        {
          t: "p",
          text: "A FastAPI backend organised into models, schemas, routes and services covers auth, folders, decks, cards, study sessions, analytics and an AI chat tutor, over PostgreSQL through SQLAlchemy 2. Authentication is JWT via python-jose with bcrypt password hashing. A separate difficulty service and analytics service feed a React frontend that renders a study heat map of activity over time.",
        },
        {
          t: "p",
          text: "It ships with real deployment configuration — a systemd unit, an nginx site and a deploy script — rather than instructions to run it locally, which is the difference between a repository and a service.",
        },
      ],
    },

    {
      slug: "tetris",
      no: 11,
      title: "Tetris — Web Edition",
      kicker: "Guideline-accurate, down to the wall kicks",
      year: 2026,
      period: "December 2025 – January 2026",
      status: "shipped",
      domain: "systems",
      featured: false,
      summary:
        "An arcade-authentic recreation of Tetris on HTML5 Canvas — full Super Rotation System with wall kicks, a 7-bag randomizer and a hold queue, rather than the simplified clone most web versions settle for.",
      metrics: [
        { label: "Rotation", value: "SRS", note: "full wall-kick tables" },
        { label: "Randomizer", value: "7-bag", note: "guideline distribution" },
        { label: "Tetris score", value: "800 × level", note: "B2B ×1.5" },
        { label: "Themes", value: "4", note: "classic, neon, retro, midnight" },
      ],
      stack: ["TypeScript", "HTML5 Canvas", "Vite", "Docker", "nginx"],
      links: [
        { label: "Play", href: "https://tetris-flame-ten.vercel.app", kind: "live" },
        { label: "Source", href: "https://github.com/bhargavvz/Tetris", kind: "repo" },
      ],
      body: [
        {
          t: "p",
          text: "The goal was to implement the official Tetris guideline faithfully rather than approximate it: the full Super Rotation System with wall-kick tables for every piece, a 7-bag randomizer so piece distribution is fair rather than merely random, and a hold queue for strategic play. Rendering is on HTML5 Canvas for hardware-accelerated frames.",
        },
        { t: "h", text: "Scoring, exactly" },
        {
          t: "p",
          text: "Single 100, double 300, triple 500 and Tetris 800, each multiplied by level, with soft drop scoring one per cell and hard drop two. Combos add fifty per combo per level, and back-to-back difficult clears carry a 1.5× multiplier. Getting these constants right is what separates a game that feels like Tetris from one that merely looks like it — the scoring table is the thing experienced players notice within thirty seconds.",
        },
        {
          t: "p",
          text: "Modern touches sit on top: a ghost piece previewing the landing position, particle effects on line clears, screen shake, four visual themes, and configurable starting level from 1 to 20. Controls cover keyboard with the standard bindings plus full touch support — tap to rotate, swipe to move, swipe up to hard drop — and high scores and settings persist in local storage. Built with Vite and containerised behind nginx for production.",
        },
      ],
    },

    {
      slug: "chess-stockfish",
      no: 12,
      title: "Chess vs. Stockfish",
      kicker: "A full engine in a Web Worker, no backend",
      year: 2025,
      period: "May – June 2025",
      status: "shipped",
      domain: "systems",
      featured: false,
      summary:
        "A chess application running Stockfish entirely client-side through Web Workers — five difficulty levels, live position evaluation and move suggestions, with no server doing the calculation.",
      metrics: [
        { label: "Engine", value: "Stockfish", note: "in-browser, Web Worker" },
        { label: "Difficulty levels", value: "5", note: "beginner to grandmaster" },
        { label: "Backend", value: "None", note: "zero server cost" },
        { label: "Board themes", value: "4", note: "4 piece sets" },
      ],
      stack: ["React", "JavaScript", "Web Workers", "chess.js", "Vercel"],
      links: [
        {
          label: "Source",
          href: "https://github.com/bhargavvz/chess-stockfish17",
          kind: "repo",
        },
      ],
      body: [
        {
          t: "p",
          text: "Stockfish runs client-side in a Web Worker, so the engine never blocks the interface and no backend is required for move calculation — which removes the latency and the hosting bill in one decision. Rules and move validation are handled by chess.js, keeping the engine integration concerned only with search.",
        },
        {
          t: "p",
          text: "Five difficulty levels run from Beginner to Grandmaster, with real-time position evaluation, move suggestions and full history in algebraic notation. The interface uses click-to-move rather than drag-and-drop — which is both more accessible and far better on touch — with legal-move highlighting, last-move indication, four board themes, four piece styles and optional sound.",
        },
        {
          t: "p",
          text: "The component split is deliberately conventional: a game orchestrator, a board renderer, an AI adapter that owns all engine communication, a move history view and a controls panel. Keeping every Stockfish message inside one adapter is what makes the difficulty levels and the evaluation display straightforward instead of tangled.",
        },
      ],
    },

    {
      slug: "noxdiary",
      no: 13,
      title: "NoxDiary",
      kicker: "A journal that stays on the device",
      year: 2025,
      period: "January – February 2025",
      status: "shipped",
      domain: "security",
      featured: false,
      summary:
        "A privacy-first mood tracking and journaling app. Local-first, AES-256 encrypted, with biometric and pattern lock — built in clean architecture on Flutter, Riverpod and Hive.",
      metrics: [
        { label: "Encryption", value: "AES-256", note: "per entry, local-first" },
        { label: "Mood levels", value: "5", note: "terrible to excellent" },
        { label: "Key storage", value: "Keychain", note: "and Android Keystore" },
        { label: "Backup", value: "Encrypted", note: "Google Drive, optional" },
      ],
      stack: [
        "Flutter",
        "Dart",
        "Riverpod",
        "Hive",
        "Flutter Secure Storage",
        "FL Chart",
        "Freezed",
      ],
      links: [{ label: "Source", href: "https://github.com/bhargavvz/NoxDiary", kind: "repo" }],
      body: [
        {
          t: "p",
          text: "Unlike cloud-based journaling apps, NoxDiary is local-first: every entry lives on the device, encrypted with AES-256 before storage, behind biometric or pattern authentication with a configurable auto-lock. Encryption keys live in the platform keychain — iOS Keychain and Android Keystore — rather than in application storage, which is the distinction between encrypting data and merely obfuscating it.",
        },
        { t: "h", text: "Built for actually using it" },
        {
          t: "p",
          text: "A rich text editor with Markdown support and tagging handles the writing; edit history with diff highlighting lets users see how a thought changed over time. Mood tracking spans five levels, and FL Chart renders trends across weeks, months and years alongside streak counters, total word counts and mood distribution. A dedicated gratitude journal and a distraction-free focus mode round out the wellness side.",
        },
        {
          t: "p",
          text: "The architecture is textbook three-layer — presentation widgets and Riverpod notifiers, a domain layer of entities and repository interfaces, and a data layer implementing those interfaces over Hive and secure storage. Code generation via Freezed keeps the models immutable. Optional encrypted Google Drive backup and full data export exist so that choosing this app is not a commitment you cannot reverse.",
        },
      ],
    },

    {
      slug: "voxera",
      no: 14,
      title: "Voxera",
      kicker: "The voice of ideas — short-form text social",
      year: 2025,
      period: "December 2024 – February 2025",
      status: "shipped",
      domain: "product",
      featured: false,
      summary:
        "A text-based social platform for sharing and discussing ideas: short posts called Vox, real-time direct messaging over Socket.IO, live notifications and a global discovery feed.",
      metrics: [
        { label: "Messaging", value: "Real-time", note: "Socket.IO" },
        { label: "Auth", value: "JWT + bcrypt", note: "Supabase-backed" },
      ],
      stack: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "PostgreSQL", "Socket.IO", "Docker"],
      links: [{ label: "Source", href: "https://github.com/bhargavvz/voxera", kind: "repo" }],
      body: [
        {
          t: "p",
          text: "The name blends “Vox” — Latin for voice — with “-era”, reflecting the platform's goal of giving users a real voice in global conversation.",
        },
        {
          t: "p",
          text: "A Next.js and Tailwind frontend sits over Supabase authentication and a PostgreSQL database, with JWT and bcrypt securing the backend. Users create accounts and profiles, publish short text posts to a global discoverable feed, and hold real-time direct message conversations with live notifications through Socket.IO. Containerised with Docker for deployment.",
        },
      ],
    },

    {
      slug: "stock-sentiment",
      no: 15,
      title: "Stock Sentiment Prediction",
      kicker: "Six algorithms, one ensemble vote",
      year: 2024,
      period: "November – December 2024",
      status: "shipped",
      domain: "ml",
      featured: false,
      summary:
        "An NLP system analysing social media sentiment to predict stock market trends, comparing six classifiers head to head and combining them through ensemble voting.",
      metrics: [
        { label: "Best model", value: "93.29%", note: "K-Neighbors" },
        { label: "Spread", value: "3.6 pts", note: "best to worst" },
        { label: "Algorithms", value: "6", note: "combined by voting" },
        { label: "Training records", value: "14,000+", note: "sentiment-labelled" },
      ],
      stack: ["Python", "Django 3.2", "scikit-learn", "TensorFlow", "TF-IDF", "NLTK"],
      links: [
        { label: "Source", href: "https://github.com/bhargavvz/Stock_Analysis", kind: "repo" },
      ],
      figures: [
        {
          id: "stock-models",
          kind: "bars",
          unit: "%",
          max: 100,
          caption:
            "Six classifiers on identical features. The interesting result is the spread: 3.6 points separates the best from the worst, which says the features are doing the work, not the model choice.",
          bars: [
            { label: "K-Neighbors", value: 93.29 },
            { label: "Logistic Regression", value: 92.31 },
            { label: "Gradient Boosting", value: 92.14 },
            { label: "Deep Neural Network", value: 91.82 },
            { label: "Decision Tree", value: 91.0 },
            { label: "Support Vector Machine", value: 89.69 },
          ],
        },
      ],
      body: [
        {
          t: "p",
          text: "Raw text runs through a full NLP preprocessing pipeline — cleaning, tokenization, stop-word removal, lemmatization, then TF-IDF vectorisation with n-gram feature extraction — before being fed to six different classifiers: a deep neural network, SVM, logistic regression, decision tree, K-Neighbors and gradient boosting, combined through a voting ensemble.",
        },
        { t: "figure", ref: "stock-models" },
        {
          t: "p",
          text: "K-Neighbors came out best at 93.29% accuracy with precision, recall and F1 all at 0.933. But the more useful observation is the narrowness of the field: only 3.6 percentage points separate the best model from the worst, and a KNN beating a deep network on the same features is a strong hint that the TF-IDF representation is carrying the signal and the classifier is close to irrelevant. The ensemble exists for robustness rather than for accuracy.",
        },
        {
          t: "note",
          text: "Trained on 14,000+ labelled records and served through a Django web application with a prediction interface and results dashboard. Sentiment correlates with price movement in a dataset; that is not the same as predicting the market, and this project does not claim to.",
        },
      ],
    },

    {
      slug: "legal-doc-analysis",
      no: 16,
      title: "Legal Document Analysis",
      kicker: "Hybrid NLP over Indian Supreme Court judgments",
      year: 2025,
      period: "April – May 2025",
      status: "shipped",
      domain: "ml",
      featured: false,
      summary:
        "A tool for making sense of complex legal judgments — combining rule-based extraction with three transformer models to surface insights that would otherwise take a legal professional hours.",
      metrics: [
        { label: "Summarization", value: "BART-large-cnn" },
        { label: "Classification", value: "Legal-BERT", note: "nlpaueb, legal corpus" },
        { label: "Entities", value: "BERT NER", note: "dslim/bert-base-NER" },
        { label: "Topics", value: "LDA", note: "clustering by theme" },
      ],
      stack: ["Python", "Flask", "Transformers", "BART", "Legal-BERT", "LDA", "TF-IDF"],
      links: [
        {
          label: "Source",
          href: "https://github.com/bhargavvz/Legal.doc.analysis",
          kind: "repo",
        },
      ],
      body: [
        {
          t: "p",
          text: "The system runs two analysis paths over the same document. The rule-based path extracts and cleans PDF text, then pattern-matches legal entities — judges, parties, statutes, sections and case citations — along with dates and metadata, keyword extraction and simple extractive summarisation. It is fast, deterministic and needs no GPU.",
        },
        {
          t: "p",
          text: "The ML path layers on three specific models: facebook/bart-large-cnn for abstractive summarisation, nlpaueb/legal-bert-base-uncased for document classification, and dslim/bert-base-NER for entity recognition, with LDA topic modelling for clustering documents by theme. The two paths are toggleable independently, so the tool degrades to something usable rather than failing when the models are unavailable.",
        },
        {
          t: "note",
          text: "Models are lazily loaded and cached on first use, large documents are chunked to bound memory, and GPU is used when present. Those three decisions are what make a transformer stack usable from a Flask app on modest hardware.",
        },
      ],
    },

    {
      slug: "contact-manager",
      no: 17,
      title: "Contact Manager",
      kicker: "ASP.NET Core 8 with the boring parts done properly",
      year: 2025,
      period: "June – July 2025",
      status: "shipped",
      domain: "product",
      featured: false,
      summary:
        "A contact management system that goes past basic CRUD — dashboard statistics, role-based identity, and CSV/XML import-export with duplicate detection.",
      metrics: [
        { label: "Framework", value: ".NET 8", note: "EF Core, SQLite" },
        { label: "Import/export", value: "CSV + XML", note: "duplicate detection" },
        { label: "Identity", value: "Role-based", note: "ASP.NET Core Identity" },
      ],
      stack: [
        "ASP.NET Core 8",
        "C#",
        "Entity Framework Core",
        "SQLite",
        "Razor Pages",
        "Bootstrap 5",
        "CsvHelper",
      ],
      links: [
        {
          label: "Source",
          href: "https://github.com/bhargavvz/Contact_Manager",
          kind: "repo",
        },
      ],
      body: [
        {
          t: "p",
          text: "A dashboard reports total contacts, favourites and monthly growth with a computed growth rate, alongside recent and favourited contacts. Contact management covers full CRUD with profile photo upload, favouriting, advanced search and filtering, sorting and pagination for large lists.",
        },
        {
          t: "p",
          text: "Authentication runs on ASP.NET Core Identity with registration, login, password reset and role-based access control. Data exports to CSV via CsvHelper for spreadsheet use and to XML for structured interchange, with bulk XML import that detects duplicates on the way in — the feature that decides whether an import tool is usable twice.",
        },
      ],
    },

    {
      slug: "cookbook",
      no: 18,
      title: "Cookbook",
      kicker: "One Flutter codebase, three targets, real backend",
      year: 2025,
      period: "July – August 2025",
      status: "shipped",
      domain: "product",
      featured: false,
      summary:
        "A cross-platform recipe app on Android, iOS and web from a single Flutter codebase, backed by Supabase with a defined PostgreSQL schema rather than bundled static data.",
      metrics: [
        { label: "Targets", value: "3", note: "Android, iOS, web" },
        { label: "Backend", value: "Supabase", note: "PostgreSQL schema + seed" },
      ],
      stack: ["Flutter", "Dart", "Supabase", "PostgreSQL"],
      links: [{ label: "Source", href: "https://github.com/bhargavvz/Cookbook", kind: "repo" }],
      body: [
        {
          t: "p",
          text: "Structured feature-first — auth, categories, favourites, recipe creation and a dedicated cooking mode — over a core layer of theming, reusable widgets and a Supabase service with its own caching layer. The PostgreSQL schema and seed data are defined in the repository, giving the app a proper client-server architecture instead of shipping recipes as assets.",
        },
        {
          t: "p",
          text: "The cooking mode screen is the part worth noting: a separate presentation of the same recipe designed for someone whose hands are covered in flour, which is a different interface problem from browsing.",
        },
      ],
    },

    {
      slug: "azura",
      no: 19,
      title: "Azura 2025",
      kicker: "Event registration built under a deadline",
      year: 2025,
      period: "March – April 2025",
      status: "shipped",
      domain: "product",
      featured: false,
      summary:
        "End-to-end participant registration for a college technical event, with payment links, automated email confirmation and team-based pricing rules.",
      metrics: [
        { label: "Confirmations", value: "Automated", note: "SMTP via Nodemailer" },
        { label: "Store", value: "Supabase", note: "typed registrations table" },
      ],
      stack: ["React", "TypeScript", "Vite", "Supabase", "Nodemailer", "Vercel"],
      links: [{ label: "Source", href: "https://github.com/bhargavvz/Azura", kind: "repo" }],
      body: [
        {
          t: "p",
          text: "A responsive registration form captures participant details, college, roll number, department, year, selected event and team members, into a Supabase table with a typed schema. Registration fee is stored per entry, with CSI membership as a boolean that drives differentiated pricing.",
        },
        {
          t: "p",
          text: "Payment links handle fees, and Nodemailer over SMTP sends automatic confirmations, removing the manual follow-up that otherwise consumes a volunteer's week. Deployed on Vercel with all credentials supplied as environment variables. It is not architecturally ambitious; it ran a real event on a fixed date, which was the requirement.",
        },
      ],
    },

    {
      slug: "age-detection",
      no: 20,
      title: "Age & Gender Detection",
      kicker: "A transfer-learning pipeline with no training required",
      year: 2025,
      period: "April – May 2025",
      status: "shipped",
      domain: "ml",
      featured: false,
      summary:
        "Real-time face detection predicting gender and age bracket from images or webcam video, built entirely on OpenCV's DNN module with pre-trained Caffe models.",
      metrics: [
        { label: "Age buckets", value: "8", note: "0–2 through 60–100" },
        { label: "Training required", value: "None", note: "Caffe Model Zoo weights" },
        { label: "Input", value: "Image or webcam" },
      ],
      stack: ["Python", "OpenCV", "Caffe", "NumPy"],
      links: [
        { label: "Source", href: "https://github.com/bhargavvz/Age_Detection", kind: "repo" },
      ],
      body: [
        {
          t: "p",
          text: "The pipeline locates faces with OpenCV's DNN face detector, then runs each detected region through two separate CNNs — one for gender, one for age — bucketing predictions into eight ranges: 0–2, 4–6, 8–12, 15–20, 25–32, 38–43, 48–53 and 60–100. Results are drawn onto the source image or video frame.",
        },
        {
          t: "note",
          text: "Age is predicted as a bracket rather than a number, and the brackets are non-contiguous by design — the model is calibrated for the ranges it was trained on, and interpolating between them would invent precision that is not there.",
        },
        {
          t: "p",
          text: "Everything runs on pre-trained Caffe Model Zoo weights with no training step, which is the point: it is a demonstration of an end-to-end transfer-learning pipeline for facial attribute prediction, assembled rather than trained.",
        },
      ],
    },
  ],

  awards: [
    {
      title: "2nd Runner-Up",
      detail:
        "HackByte, a national-level hackathon at Vellore Institute of Technology, Andhra Pradesh.",
      org: "VIT-AP",
      date: "October 2024",
    },
    {
      title: "Honorable Mention — SDG 11",
      detail:
        "Sustainable Cities and Communities track at Hack4SDG, for Communitfx, among more than 200 competing projects.",
      org: "IIT Hyderabad",
      date: "October 2024",
    },
    {
      title: "Finalist",
      detail: "Specathon 2024, a 36-hour national-level hackathon.",
      org: "St. Peter's Engineering College",
      date: "September 2024",
    },
    {
      title: "Intinta Innovator",
      detail: "Selected as an Intinta Innovator by the Government of Telangana.",
      org: "Government of Telangana",
      date: "2023",
    },
  ],

  credentials: [
    { title: "Introduction to Programming Using Python", issuer: "Tutedude", id: "TD-ADEP-PY-2101" },
    { title: "Python with DSA", issuer: "Tutedude", id: "TD-ADEP-DP-0819" },
    { title: "Competitive Programming", issuer: "Tutedude", id: "TD-ADEP-CP-0826" },
    { title: "SQL", issuer: "Tutedude", id: "TD-ADEP-SQ-0824" },
  ],

  education: [
    {
      school: "CMR College of Engineering & Technology",
      qualification: "B.Tech, Computer Science & Engineering",
      period: "2022 – 2026",
      result: "CPI 7.53",
    },
  ],

  skills: [
    {
      group: "Machine learning",
      note: "Where most of the last two years went.",
      items: [
        "PyTorch",
        "XGBoost",
        "LightGBM",
        "scikit-learn",
        "LoRA / QLoRA",
        "Grad-CAM",
        "Transformers",
        "OpenCV",
      ],
    },
    {
      group: "Languages",
      note: "C and C++ are the ones I had to earn.",
      items: ["Python", "C", "C++", "Java", "TypeScript", "Dart", "SQL", "C#"],
    },
    {
      group: "Cloud & DevOps",
      note: "Enough to deploy what I build without asking anyone.",
      items: [
        "AWS",
        "Oracle Cloud",
        "Docker",
        "nginx",
        "systemd",
        "GitHub Actions",
        "Jenkins",
        "Linux",
      ],
    },
    {
      group: "Backend & web",
      note: "REST first, opinionated about schemas.",
      items: ["FastAPI", "Spring Boot", "Flask", "Django", "Next.js", "React", "Node.js", "ASP.NET Core"],
    },
    {
      group: "Data",
      note: "PostgreSQL by default; anything else needs a reason.",
      items: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Supabase", "Firebase", "SQLite", "Hive"],
    },
    {
      group: "Testing & QA",
      note: "The part of the SDLC people skip and then regret.",
      items: [
        "Manual testing",
        "API testing (Postman)",
        "JUnit",
        "Test case design",
        "SDLC / STLC",
        "Bug tracking",
      ],
    },
  ],
};
