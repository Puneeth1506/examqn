import { Quiz } from '../types/quiz';
import heroBanner from '../assets/images/exam_hero_banner_1790447603517.jpg';
import techImage from '../assets/images/category_tech_cs_1790447617028.jpg';
import scienceImage from '../assets/images/category_med_science_1790447631881.jpg';
import quantImage from '../assets/images/category_finance_quant_1790447642556.jpg';

export const ASSET_IMAGES = {
  hero: heroBanner,
  tech: techImage,
  science: scienceImage,
  quant: quantImage,
};

export const PREBUILT_QUIZZES: Quiz[] = [
  {
    id: 'quiz-swe-systems',
    title: 'Full-Stack Engineering & Distributed Systems Mock',
    description: 'Comprehensive evaluation covering modern frontend rendering lifecycles, concurrency, microservice consistency, and database indexing.',
    category: 'Computer Science',
    difficulty: 'Advanced',
    durationMinutes: 20,
    negativeMarking: 0.25,
    marksPerQuestion: 1,
    passPercentage: 70,
    imageKey: 'tech',
    createdAt: '2026-03-20',
    sections: [
      {
        id: 'sec-swe-frontend',
        title: 'Section 1: Modern Web Runtimes & Concurrency',
        description: 'React Fiber reconciliation, event loop microtasks, and browser rendering pipeline.',
        questions: [
          {
            id: 'swe-q1',
            text: 'In the Node.js / JavaScript event loop, which phase executes callbacks scheduled via process.nextTick() and Promise microtasks?',
            options: [
              'Between each phase of the libuv event loop immediately after the current operation finishes',
              'Exclusively inside the Poll phase before I/O descriptors are checked',
              'Only during the Check phase alongside setImmediate handlers',
              'At the beginning of the Timers phase before setTimeout handlers run'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'The microtask queue (which includes process.nextTick in Node.js and Promise reactions) is processed immediately after the currently running script or operation completes, before the event loop transitions to the next phase or picks the next macrotask.',
            topic: 'Event Loop & Runtimes',
            difficulty: 'medium',
            hint: 'Microtasks have priority over macro-task queues and drain completely before advancing.'
          },
          {
            id: 'swe-q2',
            text: 'Consider the following TypeScript code snippet regarding immutable updates. What is the performance characteristic of the operation?',
            codeSnippet: `interface NodeState {\n  readonly id: string;\n  readonly children: ReadonlyArray<NodeState>;\n}\n\nfunction updateDeepNode(root: NodeState, targetId: string, val: string): NodeState {\n  if (root.id === targetId) return { ...root, id: val };\n  return {\n    ...root,\n    children: root.children.map(child => updateDeepNode(child, targetId, val))\n  };\n}`,
            options: [
              'O(N) time and O(D) space where D is recursion depth, preserving reference identity for non-mutated sibling subtrees',
              'O(1) time due to structural sharing in modern V8 engines',
              'O(N^2) time because spread syntax performs a deep clone of the entire prototype chain',
              'O(log N) time because TypeScript interfaces automatically compile into self-balancing Red-Black trees'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'The function traverses the tree (worst-case O(N) when searching all nodes) and allocates new parent objects along the target path while maintaining existing object references for untouched sibling branches (structural sharing).',
            topic: 'Functional Programming & Memory',
            difficulty: 'hard',
            hint: 'Notice that map produces a new children array only for ancestors of the updated node, preserving unaffected subtree references.'
          },
          {
            id: 'swe-q3',
            text: 'When implementing optimistic UI updates with HTTP mutation requests, what is the safest recovery strategy when the network request yields an HTTP 409 Conflict?',
            options: [
              'Roll back to the server-confirmed snapshot, re-fetch authoritative resource state, and present merge resolution to the user',
              'Silently retry the identical payload indefinitely with exponential backoff until 200 OK is returned',
              'Force-overwrite the server record using HTTP PUT with an unconditional If-Match header',
              'Clear local storage cache and redirect the user immediately to the login authentication route'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'HTTP 409 indicates that the request conflicts with current server state (often due to stale ETags or concurrent edits). The client must revert speculative local state to prevent data corruption and synchronize authoritative changes.',
            topic: 'API & State Synchronization',
            difficulty: 'medium',
            hint: 'Optimistic state must always be undoable if an irreconcilable conflict occurs.'
          },
          {
            id: 'swe-q4',
            text: 'Evaluate the two statements regarding Database B-Tree indexes:\nAssertion (A): A composite B-tree index on columns (A, B, C) can satisfy an equality query on column (B) alone with a fast index seek.\nReason (R): B-Trees sort compound keys lexicographically starting with the leftmost prefix column.',
            assertion: 'A composite index on (A, B, C) directly accelerates an equality filter on (B) via index seek.',
            reason: 'Composite B-Tree entries are ordered primarily by the leading key column A.',
            options: [
              'Assertion (A) is FALSE, but Reason (R) is TRUE',
              'Both (A) and (R) are TRUE, and (R) is the correct explanation of (A)',
              'Both (A) and (R) are TRUE, but (R) is NOT the correct explanation of (A)',
              'Assertion (A) is TRUE, but Reason (R) is FALSE'
            ],
            correctIndex: 0,
            type: 'assertion_reason',
            explanation: 'Assertion is False: Because the composite index is sorted lexicographically by column A first, querying on B without providing A prevents an index seek (it requires an index skip scan or full table scan). Reason is True: B-trees indeed order composite keys strictly by the leftmost column first.',
            topic: 'Database Engineering',
            difficulty: 'hard',
            hint: 'Think about looking up a person in a phone book indexed by (Last Name, First Name) when you only know their first name.'
          },
          {
            id: 'swe-q5',
            text: 'Which of the following headers should be configured to prevent Cross-Site Scripting (XSS) attackers from stealing session tokens stored in browser cookies?',
            options: [
              'Set-Cookie: token=xyz; HttpOnly; Secure; SameSite=Strict',
              'Access-Control-Allow-Origin: *',
              'Content-Security-Policy: default-src * unsafe-inline',
              'Cache-Control: no-cache, no-store, must-revalidate'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'The HttpOnly flag prevents client-side JavaScript (document.cookie) from accessing the session token, mitigating direct cookie theft via injected XSS scripts.',
            topic: 'Web Security',
            difficulty: 'easy',
            hint: 'Look for the cookie flag specifically designed to block client-side JavaScript access.'
          }
        ]
      },
      {
        id: 'sec-swe-backend',
        title: 'Section 2: Distributed Systems & Data Architecture',
        description: 'CAP theorem, idempotency keys, quorum consensus, and cache invalidation.',
        questions: [
          {
            id: 'swe-q6',
            text: 'In distributed transaction architecture, which consensus protocol guarantees safety under arbitrary network partitions without sacrificing linearizable reads?',
            options: [
              'Raft / Multi-Paxos with strict quorum acknowledgment (majority nodes)',
              'Two-Phase Commit (2PC) with a single centralized coordinator',
              'Gossip protocol with eventual convergence',
              'Round-Robin DNS health check failover'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Raft and Multi-Paxos require a majority quorum (N/2 + 1) to commit log entries and serve linearizable reads (with leader lease checks), preventing split-brain anomalies under network partitions.',
            topic: 'Distributed Consensus',
            difficulty: 'hard',
            hint: 'Consensus algorithms require majority agreement to prevent divergent leader elections.'
          },
          {
            id: 'swe-q7',
            text: 'When designing an idempotent payment endpoint (POST /api/v1/charges), what is the industry standard mechanism to prevent duplicate billing from network retries?',
            options: [
              'Requiring a client-generated Idempotency-Key header stored in an atomic atomic key-value store with response cache',
              'Rejecting all subsequent requests made within 60 seconds from the same IP address',
              'Converting the HTTP POST method into an HTTP GET method',
              'Truncating the payment amount to integer cents'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'An Idempotency-Key allows the server to identify retransmitted requests. The server records the key atomically before processing and caches the original response, returning the saved response on identical retransmissions.',
            topic: 'API Architecture',
            difficulty: 'medium',
            hint: 'Stripe and PayPal standardize client-supplied unique tokens in request headers.'
          },
          {
            id: 'swe-q8',
            text: 'Under the Cache-Aside pattern, what sequence of operations minimizes race conditions between concurrent database writes and cache reads?',
            options: [
              'Update the database first, then delete (invalidate) the cache key',
              'Update the cache first, then asynchronously persist to the database without a transaction',
              'Delete the database record, wait 10 seconds, then flush all Redis instances',
              'Always update both the database and cache simultaneously in a non-blocking background thread'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Updating the database first and then evicting/deleting the cache key prevents stale cache overwrites. If the cache is invalidated before DB write completes, a concurrent read could re-populate the cache with pre-write stale data.',
            topic: 'Caching Strategies',
            difficulty: 'medium',
            hint: 'Cache eviction after authoritative DB persistence is the standard cache-aside idiom.'
          },
          {
            id: 'swe-q9',
            text: 'Which distributed database anomaly occurs when Transaction T1 reads a set of rows satisfying a condition, Transaction T2 inserts a new row satisfying that condition and commits, and T1 re-reads the condition encountering the new row?',
            options: [
              'Phantom Read',
              'Dirty Read',
              'Non-Repeatable Read (Fuzzy Read)',
              'Lost Update'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'A Phantom Read occurs when a query with a search predicate returns a different set of rows upon re-execution within the same transaction due to another committed transaction inserting or deleting rows.',
            topic: 'Database Isolation Levels',
            difficulty: 'medium',
            hint: 'Think of "new rows appearing like phantoms" in range queries.'
          },
          {
            id: 'swe-q10',
            text: 'In message streaming systems like Apache Kafka, what happens to message ordering when a topic has multiple partitions and messages are published without a partition key?',
            options: [
              'Messages are round-robined across partitions, guaranteeing total order only WITHIN each individual partition, not globally',
              'Total global ordering across all partitions is maintained by the Zookeeper/KRaft controller',
              'All messages are rejected with an InvalidRecordException',
              'Kafka converts the topic into a single-consumer FIFO buffer'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Kafka guarantees strict message ordering only within a single partition. Without a partition key (or sticky partitioner), messages distribute across partitions, so inter-partition ordering cannot be guaranteed.',
            topic: 'Event Streaming',
            difficulty: 'medium',
            hint: 'Kafka partition-level sequencing guarantees vs global topic ordering.'
          }
        ]
      }
    ]
  },
  {
    id: 'quiz-medical-pharmacology',
    title: 'Clinical Pharmacology & Therapeutics Mock',
    description: 'High-yield clinical vignettes covering pharmacokinetics, autonomic pharmacology, antibiotic mechanisms, and drug-drug interactions.',
    category: 'Medical Science',
    difficulty: 'Comprehensive',
    durationMinutes: 25,
    negativeMarking: 0.25,
    marksPerQuestion: 1,
    passPercentage: 65,
    imageKey: 'science',
    createdAt: '2026-03-21',
    sections: [
      {
        id: 'sec-med-principles',
        title: 'Section 1: Pharmacokinetics & Autonomics',
        description: 'Clearance, volume of distribution, receptor kinetics, and sympatholytics.',
        questions: [
          {
            id: 'med-q1',
            text: 'A 58-year-old male with septic shock is receiving an intravenous infusion of a constant-rate drug. The drug has a half-life of 6 hours. Approximately what percentage of steady-state concentration (Css) will be achieved after 18 hours?',
            options: [
              '87.5%',
              '50.0%',
              '75.0%',
              '99.0%'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Steady-state concentration approaches via first-order kinetics: 1 half-life = 50%, 2 half-lives = 75%, 3 half-lives = 87.5%, 4 half-lives = 93.75%, 5 half-lives = 96.8%. 18 hours equals 3 half-lives (18/6 = 3), resulting in 87.5% of Css.',
            topic: 'Pharmacokinetics',
            difficulty: 'easy',
            hint: 'Calculate the number of half-lives elapsed (18 ÷ 6) and use (1 - 0.5^n).'
          },
          {
            id: 'med-q2',
            text: 'Which enzyme is irreversibly inhibited by Organophosphate insecticides, causing excessive parasympathetic activation, bronchorrhea, and skeletal muscle fasciculations?',
            options: [
              'Acetylcholinesterase',
              'Monoamine Oxidase A',
              'Catechol-O-methyltransferase',
              'Dopamine beta-hydroxylase'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Organophosphates form a covalent bond with the serine hydroxyl group in the active site of acetylcholinesterase, leading to acetylcholine accumulation at both muscarinic and nicotinic receptors (SLUDGE syndrome).',
            topic: 'Autonomic Pharmacology',
            difficulty: 'medium',
            hint: 'Think of the SLUDGEM mnemonic (Salivation, Lacrimation, Urination, Defecation, GI cramping, Emesis, Miosis).'
          },
          {
            id: 'med-q3',
            text: 'A 64-year-old female with chronic kidney disease (eGFR 22 mL/min/1.73m²) presents with atrial fibrillation. Which anticoagulant requires strict dose adjustment or should be avoided due to extensive renal elimination?',
            options: [
              'Dabigatran',
              'Apixaban',
              'Warfarin',
              'Heparin'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Dabigatran is predominantly (~80%) eliminated unchanged by the kidneys, posing a severe risk of accumulation and fatal hemorrhage in severe renal impairment (CrCl < 30 mL/min). Warfarin and unfractionated heparin undergo hepatic clearance.',
            topic: 'Cardiovascular Therapeutics',
            difficulty: 'hard',
            hint: 'Direct thrombin inhibitor with ~80% renal excretion.'
          },
          {
            id: 'med-q4',
            text: 'Assertion (A): Nitroglycerin exhibits very low oral bioavailability (<10%) when swallowed conventionally.\nReason (R): Nitroglycerin undergoes extensive first-pass metabolism by hepatic glutathione-organic nitrate reductase.',
            assertion: 'Nitroglycerin has extremely low oral bioavailability when swallowed.',
            reason: 'It is almost completely cleared during initial hepatic portal transit before entering systemic circulation.',
            options: [
              'Both (A) and (R) are TRUE, and (R) is the correct explanation of (A)',
              'Both (A) and (R) are TRUE, but (R) is NOT the correct explanation of (A)',
              'Assertion (A) is TRUE, but Reason (R) is FALSE',
              'Assertion (A) is FALSE, but Reason (R) is TRUE'
            ],
            correctIndex: 0,
            type: 'assertion_reason',
            explanation: 'Both statements are true and Reason directly explains Assertion. Nitroglycerin is rapidly metabolized by liver glutathione-organic nitrate reductase, necessitating sublingual, transdermal, or intravenous administration to bypass first-pass clearance.',
            topic: 'Bioavailability & Metabolism',
            difficulty: 'medium',
            hint: 'Why do patients place nitroglycerin tablets under the tongue rather than swallowing them?'
          },
          {
            id: 'med-q5',
            text: 'Which drug class represents first-line therapy for essential hypertension with concurrent microalbuminuria in diabetic patients?',
            options: [
              'ACE inhibitors / Angiotensin Receptor Blockers (ARBs)',
              'Loop diuretics (e.g., Furosemide)',
              'Dihydropyridine calcium channel blockers',
              'Beta-1 selective blockers (e.g., Atenolol)'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'ACE inhibitors and ARBs dilate the efferent renal arteriole more than the afferent arteriole, reducing intraglomerular capillary hydrostatic pressure and slowing the progression of diabetic nephropathy.',
            topic: 'Renal Pharmacology',
            difficulty: 'easy',
            hint: 'Reduces intraglomerular pressure by dilating efferent arterioles.'
          }
        ]
      },
      {
        id: 'sec-med-clinical',
        title: 'Section 2: Antimicrobials & Chemotherapy',
        description: 'Bacterial resistance, protein synthesis inhibitors, and toxicities.',
        questions: [
          {
            id: 'med-q6',
            text: 'Which antibiotic binds irreversibly to the 30S ribosomal subunit, causing misreading of mRNA, and requires therapeutic drug monitoring to prevent ototoxicity and nephrotoxicity?',
            options: [
              'Gentamicin (Aminoglycoside)',
              'Azithromycin (Macrolide)',
              'Ciprofloxacin (Fluoroquinolone)',
              'Doxycycline (Tetracycline)'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Aminoglycosides (such as Gentamicin, Tobramycin) bind the 30S bacterial ribosomal subunit bactericidally. They accumulate in renal cortical tubular cells and endolymph/perilymph, risking dose-dependent nephrotoxicity and ototoxicity.',
            topic: 'Antimicrobials',
            difficulty: 'medium',
            hint: 'Bactericidal 30S inhibitor that requires monitoring peak and trough serum concentrations.'
          },
          {
            id: 'med-q7',
            text: 'What is the primary mechanism of resistance developed by Methicillin-Resistant Staphylococcus aureus (MRSA)?',
            options: [
              'Expression of mecA gene encoding altered PBP2a with low affinity for beta-lactams',
              'Hyperproduction of extracellular beta-lactamase enzyme',
              'Active efflux pump upregulation for tetracyclines',
              'Point mutations in topoisomerase IV / DNA gyrase'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'MRSA acquires the mecA gene, which encodes penicillin-binding protein 2a (PBP2a). PBP2a has markedly reduced binding affinity for virtually all standard beta-lactam antibiotics.',
            topic: 'Microbiology & Resistance',
            difficulty: 'hard',
            hint: 'Target alteration via penicillin-binding protein modification rather than enzymatic cleavage.'
          },
          {
            id: 'med-q8',
            text: 'A patient receiving Fluconazole for esophageal candidiasis starts taking Warfarin. What is the expected drug interaction outcome?',
            options: [
              'Increased Warfarin plasma levels and elevated INR leading to bleeding risk due to CYP2C9 inhibition',
              'Decreased Warfarin efficacy due to CYP3A4 induction',
              'Immediate neutralization of Fluconazole therapeutic activity',
              'Severe precipitation of drug crystals inside the bladder'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Fluconazole is a potent inhibitor of cytochrome P450 CYP2C9, the primary metabolic pathway for the active S-enantiomer of Warfarin. This results in elevated Warfarin levels, prolonged PT/INR, and substantial bleeding hazard.',
            topic: 'Drug-Drug Interactions',
            difficulty: 'hard',
            hint: 'Azole antifungals inhibit CYP enzymes that metabolize S-warfarin.'
          },
          {
            id: 'med-q9',
            text: 'Which antidote should be administered promptly to treat acetaminophen (paracetamol) hepatotoxicity by replenishing intracellular glutathione stores?',
            options: [
              'N-Acetylcysteine',
              'Naloxone',
              'Flumazenil',
              'Pralidoxime'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'N-acetylcysteine (NAC) supplies cysteine for glutathione synthesis, conjugating and neutralizing the reactive toxic metabolite NAPQI before it binds covalently to hepatic macromolecular proteins.',
            topic: 'Toxicology',
            difficulty: 'easy',
            hint: 'Replaces hepatic glutathione to conjugate toxic NAPQI.'
          },
          {
            id: 'med-q10',
            text: 'Which chemotherapeutic agent causes cumulative, irreversible cardiotoxicity through free radical generation and topoisomerase II-beta cleavage, often co-prescribed with Dexrazoxane?',
            options: [
              'Doxorubicin',
              'Methotrexate',
              'Vincristine',
              'Cisplatin'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Doxorubicin (an anthracycline) generates reactive oxygen species (ROS) and binds topoisomerase II-beta, causing cardiomyocyte apoptosis and dilated cardiomyopathy. Dexrazoxane acts as an iron-chelating cardioprotective agent.',
            topic: 'Oncology Pharmacology',
            difficulty: 'hard',
            hint: 'Anthracycline antitumor antibiotic associated with dilated cardiomyopathy.'
          }
        ]
      }
    ]
  },
  {
    id: 'quiz-algorithms-dsa',
    title: 'Algorithms, Data Structures & Complexity Drill',
    description: 'Rigorous algorithmic analysis covering asymptotic bounds, graph traversals, dynamic programming paradigms, and tree invariants.',
    category: 'Computer Science',
    difficulty: 'Advanced',
    durationMinutes: 18,
    negativeMarking: 0.25,
    marksPerQuestion: 1,
    passPercentage: 70,
    imageKey: 'tech',
    createdAt: '2026-03-22',
    sections: [
      {
        id: 'sec-dsa-trees',
        title: 'Section 1: Trees, Heaps & Graphs',
        description: 'Binary heaps, AVL rotations, topological sort, and shortest path proofs.',
        questions: [
          {
            id: 'dsa-q1',
            text: 'What is the tightest worst-case time complexity of building a Binary Max-Heap from an unsorted array of N elements using Floyd’s Bottom-Up Heapify algorithm?',
            options: [
              'O(N)',
              'O(N log N)',
              'O(N^2)',
              'O(log N)'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Building a heap bottom-up sums the cost over all nodes: sum(h=0 to log N) of ((N / 2^(h+1)) * O(h)) = O(N * sum(h / 2^h)) = O(N). Because most nodes reside near the leaves where height is small, the summation converges to linear O(N) time.',
            topic: 'Heaps & Sorting',
            difficulty: 'medium',
            hint: 'Consider the geometric series sum where the majority of nodes have height 1 or 2.'
          },
          {
            id: 'dsa-q2',
            text: 'Dijkstra’s algorithm for Single-Source Shortest Paths can produce incorrect results under which of the following graph conditions?',
            options: [
              'Graphs containing negative-weight edges, even without negative-weight cycles',
              'Directed acyclic graphs with strictly positive edge weights',
              'Disconnected undirected graphs with equal edge weights',
              'Dense graphs where |E| = O(|V|^2)'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Dijkstra makes greedy decisions assuming that once a node is settled (extracted from priority queue), its shortest distance is finalized. A negative-weight edge downstream can later provide a shorter path, invalidating this greedy property.',
            topic: 'Graph Theory',
            difficulty: 'easy',
            hint: 'Greedy choice property fails when future edges can decrease total accumulated cost.'
          },
          {
            id: 'dsa-q3',
            text: 'In an AVL Tree, after an insertion into the right subtree of the left child of an unbalanced node (Left-Right case), which sequence of rotations restores the balance invariant?',
            options: [
              'Left rotation on the left child, followed by a Right rotation on the unbalanced parent',
              'A single Right rotation on the unbalanced parent',
              'Two consecutive Right rotations on the root',
              'Right rotation on the right child, followed by a Left rotation on the grandparent'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'For a Left-Right (LR) imbalance, a Left rotation is first performed on the left child to transform the tree into a Left-Left (LL) shape, followed by a Right rotation on the unbalanced root node.',
            topic: 'Self-Balancing Search Trees',
            difficulty: 'hard',
            hint: 'Double rotation: first rotate the child to align the branch, then rotate the parent.'
          },
          {
            id: 'dsa-q4',
            text: 'Consider finding the Strongly Connected Components (SCCs) of a directed graph. Which algorithm runs in optimal O(V + E) time using two Depth-First Searches?',
            options: [
              'Kosaraju-Sharir Algorithm',
              'Bellman-Ford Algorithm',
              'Floyd-Warshall Algorithm',
              'Kruskal’s Minimum Spanning Tree'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Kosaraju’s algorithm performs a first DFS on the graph to order vertices by exit times, transposes the graph edges (G^T), and executes a second DFS in decreasing exit order, discovering each SCC in O(V + E) linear time.',
            topic: 'Graph Connectivity',
            difficulty: 'medium',
            hint: 'Relies on graph transposition (reversing all directed edges).'
          },
          {
            id: 'dsa-q5',
            text: 'What is the amortized time complexity of the Union and Find operations in a Disjoint Set Union (DSU) data structure utilizing both Path Compression and Union by Rank?',
            options: [
              'O(α(N)), where α is the inverse Ackermann function',
              'O(log N)',
              'O(1) strict worst-case for every individual call',
              'O(sqrt(N))'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Tarjan proved that combining union by rank and path compression yields an amortized time complexity of O(α(N)) per operation, where α(N) ≤ 4 for all practical inputs up to universe atoms.',
            topic: 'Advanced Data Structures',
            difficulty: 'hard',
            hint: 'Nearly constant time bounded by the inverse of a rapidly growing function.'
          }
        ]
      },
      {
        id: 'sec-dsa-dp',
        title: 'Section 2: Dynamic Programming & Complexity Classes',
        description: 'Memoization, optimal substructure, NP-completeness, and space optimization.',
        questions: [
          {
            id: 'dsa-q6',
            text: 'What is the difference between NP and NP-Complete complexity classes?',
            options: [
              'NP contains decision problems verifiable in polynomial time, while NP-Complete problems are the hardest problems in NP to which all other NP problems can be reduced in polynomial time',
              'NP problems cannot be solved on any Turing machine, whereas NP-Complete problems have O(N^3) algorithms',
              'NP is strictly equivalent to P, whereas NP-Complete contains only undecidable problems',
              'NP stands for Non-Polynomial time execution'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'A problem is in NP if a proposed solution certificate can be verified by a deterministic Turing machine in polynomial time. A problem X is NP-Complete if X ∈ NP and every problem Y ∈ NP is polynomial-time reducible to X (Cook-Levin theorem).',
            topic: 'Computational Complexity',
            difficulty: 'hard',
            hint: 'NP stands for "Nondeterministic Polynomial", not "Non-Polynomial".'
          },
          {
            id: 'dsa-q7',
            text: 'In the classic 0/1 Knapsack dynamic programming problem with N items and integer capacity W, what is the space complexity after reducing to a single 1D array?',
            options: [
              'O(W) space by iterating capacity backwards from W down to item weight',
              'O(N * W) space requiring a full matrix table',
              'O(N) space regardless of capacity W',
              'O(1) auxiliary space'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'By iterating capacity w backwards from W down to item_weight, we ensure that dp[w - item_weight] represents values from the previous item stage rather than the current one, optimizing space from O(N * W) to O(W).',
            topic: 'Dynamic Programming',
            difficulty: 'medium',
            hint: 'Iterating backwards prevents reusing the same item multiple times in 0/1 knapsack.'
          },
          {
            id: 'dsa-q8',
            text: 'Which string pattern searching algorithm preprocesses the pattern into a Longest Proper Prefix which is also a Suffix (LPS) array to achieve O(N + M) worst-case search time?',
            options: [
              'Knuth-Morris-Pratt (KMP) Algorithm',
              'Rabin-Karp Rolling Hash Algorithm',
              'Boyer-Moore with Bad Character Rule',
              'Naive Brute Force Search'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'The KMP algorithm constructs the LPS (π) array in O(M) time, allowing the search pointer in the text to never backtrack upon mismatch, delivering deterministic O(N + M) execution.',
            topic: 'String Algorithms',
            difficulty: 'medium',
            hint: 'Uses LPS array to skip redundant comparisons without rewinding the text pointer.'
          },
          {
            id: 'dsa-q9',
            text: 'What is the recurrence relation for the Master Theorem case that applies to standard Merge Sort, and what is its asymptotic solution?',
            options: [
              'T(N) = 2T(N/2) + O(N), yielding O(N log N)',
              'T(N) = 4T(N/2) + O(1), yielding O(N^2)',
              'T(N) = T(N - 1) + O(N), yielding O(N^2)',
              'T(N) = 2T(N/4) + O(N), yielding O(N)'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Merge Sort splits an array into 2 halves (2T(N/2)) and merges them in linear time O(N). By Case 2 of the Master Theorem (c = log_b(a) = log_2(2) = 1), T(N) = Θ(N log N).',
            topic: 'Asymptotic Analysis',
            difficulty: 'easy',
            hint: 'Two recursive subproblems of size N/2 plus a linear merge step.'
          },
          {
            id: 'dsa-q10',
            text: 'Which data structure supports Insert, Delete, and GetRandom() in O(1) average time?',
            options: [
              'Combination of a dynamic Array (for O(1) random index access) and a Hash Map (mapping value to array index)',
              'Single Balanced Binary Search Tree',
              'Doubly Linked List with head and tail pointers',
              'Trie data structure'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'To delete in O(1) from an array, we swap the target element with the last element and pop. The hash map tracks the index of each element in the array, while array index indexing enables true O(1) uniform GetRandom.',
            topic: 'System Data Structures',
            difficulty: 'hard',
            hint: 'Swap-with-last trick in a dynamic array coupled with hash index lookups.'
          }
        ]
      }
    ]
  },
  {
    id: 'quiz-quant-reasoning',
    title: 'Quantitative Aptitude & Statistical Reasoning Mock',
    description: 'Challenging quantitative analysis including Bayes theorem, combinatorics, conditional probabilities, and logical deduction.',
    category: 'Quantitative Reasoning',
    difficulty: 'Intermediate',
    durationMinutes: 15,
    negativeMarking: 0.25,
    marksPerQuestion: 1,
    passPercentage: 60,
    imageKey: 'quant',
    createdAt: '2026-03-23',
    sections: [
      {
        id: 'sec-quant-prob',
        title: 'Section 1: Probability & Bayesian Inference',
        description: 'Conditional probability, distributions, combinations, and permutations.',
        questions: [
          {
            id: 'quant-q1',
            text: 'A rare medical condition affects 1 in 1,000 people. A diagnostic test has a 99% true positive rate (sensitivity) and a 5% false positive rate (95% specificity). If a randomly selected person tests positive, what is the approximate probability that they actually have the condition?',
            options: [
              '~1.9% (approximately 1 in 50)',
              '~95.0%',
              '~99.0%',
              '~50.0%'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'In a population of 100,000: 100 have the condition, and 99 test positive. 99,900 do not have it, but 5% of them (4,995) falsely test positive. Total positive tests = 99 + 4,995 = 5,094. Probability = 99 / 5,094 ≈ 0.0194 or ~1.9%. (Base Rate Fallacy).',
            topic: 'Bayes Theorem',
            difficulty: 'hard',
            hint: 'Do not ignore the low prior prevalence (1/1000). False positives vastly outnumber true positives.'
          },
          {
            id: 'quant-q2',
            text: 'In how many distinct ways can a committee of 4 people be chosen from 6 engineers and 4 scientists such that the committee contains at least 1 scientist?',
            options: [
              '195 ways',
              '210 ways',
              '15 ways',
              '120 ways'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Total ways to pick any 4 people from 10 = C(10, 4) = (10 × 9 × 8 × 7) / (4 × 3 × 2 × 1) = 210. Ways with NO scientists (all 4 from 6 engineers) = C(6, 4) = C(6, 2) = 15. Ways with at least 1 scientist = 210 - 15 = 195.',
            topic: 'Combinatorics',
            difficulty: 'medium',
            hint: 'Use the complement principle: Total possible committees minus committees with zero scientists.'
          },
          {
            id: 'quant-q3',
            text: 'Two fair 6-sided dice are rolled simultaneously. What is the probability that the sum of the dice is at least 9, given that at least one of the dice shows a 5?',
            options: [
              '5 / 11',
              '4 / 11',
              '7 / 36',
              '6 / 11'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'The event "at least one die is 5" has 11 outcomes: {(5,1),(5,2),(5,3),(5,4),(5,5),(5,6),(1,5),(2,5),(3,5),(4,5),(6,5)}. Of these, sums ≥ 9 are (5,4)[sum 9], (4,5)[sum 9], (5,5)[sum 10], (5,6)[sum 11], and (6,5)[sum 11], which is 5 outcomes. P = 5/11.',
            topic: 'Conditional Probability',
            difficulty: 'medium',
            hint: 'Enumerate the 11 outcomes where at least one die is 5, then filter for sum ≥ 9.'
          },
          {
            id: 'quant-q4',
            text: 'If a dataset has a mean of 100 and a standard deviation of 15, according to Chebyshev’s Theorem, at least what percentage of data values must fall within the range [70, 130] for ANY distribution shape?',
            options: [
              'At least 75%',
              'At least 88.9%',
              'At least 95%',
              'At least 68%'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Chebyshev’s inequality states that at least (1 - 1/k^2) of data falls within k standard deviations of the mean for any distribution. Here, the range [70, 130] corresponds to k = (130 - 100) / 15 = 2 standard deviations. 1 - 1/2^2 = 1 - 1/4 = 75%.',
            topic: 'Descriptive Statistics',
            difficulty: 'medium',
            hint: 'k = (130 - 100) / 15 = 2. Apply (1 - 1/k²).'
          },
          {
            id: 'quant-q5',
            text: 'Assertion (A): The geometric mean of any set of positive unequal numbers is strictly less than their arithmetic mean.\nReason (R): By Cauchy-Schwarz / AM-GM inequality, equality (AM = GM) holds if and only if all terms in the set are identical.',
            assertion: 'For any set of positive distinct numbers, the Geometric Mean is strictly strictly smaller than the Arithmetic Mean.',
            reason: 'The AM-GM inequality establishes that AM ≥ GM with equality occurring solely when all numbers are equal.',
            options: [
              'Both (A) and (R) are TRUE, and (R) is the correct explanation of (A)',
              'Both (A) and (R) are TRUE, but (R) is NOT the correct explanation of (A)',
              'Assertion (A) is TRUE, but Reason (R) is FALSE',
              'Assertion (A) is FALSE, but Reason (R) is TRUE'
            ],
            correctIndex: 0,
            type: 'assertion_reason',
            explanation: 'Both statements are true and Reason directly explains the Assertion. The AM-GM inequality states (x1 + ... + xn)/n ≥ (x1*...*xn)^(1/n), with strict inequality whenever the values are not all identical.',
            topic: 'Mathematical Inequalities',
            difficulty: 'easy',
            hint: 'AM-GM inequality states equality holds exclusively when numbers are identical.'
          }
        ]
      },
      {
        id: 'sec-quant-logic',
        title: 'Section 2: Logical Deduction & Data Sufficiency',
        description: 'Syllogisms, sequences, and quantitative critical reasoning.',
        questions: [
          {
            id: 'quant-q6',
            text: 'Find the next number in the sequence: 3, 7, 17, 39, 85, ?',
            options: [
              '181',
              '179',
              '187',
              '171'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Pattern: Each term is multiplied by 2 and then increases by an alternating odd sequence:\n3 * 2 + 1 = 7\n7 * 2 + 3 = 17\n17 * 2 + 5 = 39\n39 * 2 + 7 = 85\nNext term: 85 * 2 + 9 = 170 + 9 = 181.',
            topic: 'Number Sequences',
            difficulty: 'medium',
            hint: 'Look at (term × 2) plus successive odd numbers: +1, +3, +5, +7, +9...'
          },
          {
            id: 'quant-q7',
            text: 'A merchant sells an article at a 20% discount on the marked price and still makes a 20% profit on cost. If the cost price is $200, what was the marked price?',
            options: [
              '$300',
              '$280',
              '$260',
              '$320'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Selling Price (SP) with 20% profit on $200 cost = 200 * 1.20 = $240. Marked Price (MP) with 20% discount implies SP = 0.80 * MP. Therefore, MP = 240 / 0.80 = $300.',
            topic: 'Commercial Arithmetic',
            difficulty: 'easy',
            hint: 'Cost = $200 -> Selling Price = $240. $240 is 80% of Marked Price.'
          },
          {
            id: 'quant-q8',
            text: 'A tank can be filled by Pipe A in 6 hours and Pipe B in 8 hours. Pipe C can empty the full tank in 12 hours. If all three pipes are opened together at 7:00 AM, at what time will the tank be completely filled?',
            options: [
              '11:48 AM',
              '12:00 PM',
              '11:30 AM',
              '1:15 PM'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Net rate per hour = 1/6 + 1/8 - 1/12 = (4 + 3 - 2) / 24 = 5/24 tanks per hour. Time to fill = 24/5 hours = 4.8 hours = 4 hours and 48 minutes. Starting from 7:00 AM + 4h 48m = 11:48 AM.',
            topic: 'Rates & Work Problems',
            difficulty: 'medium',
            hint: 'Find LCM of 6, 8, 12 (which is 24) to calculate pipe efficiencies: +4, +3, -2.'
          },
          {
            id: 'quant-q9',
            text: 'A bag contains 5 red balls and 4 blue balls. Two balls are drawn successively without replacement. What is the probability that both balls are of the same color?',
            options: [
              '4 / 9',
              '5 / 9',
              '2 / 9',
              '1 / 2'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'Total pairs: C(9, 2) = 36. Both red: C(5, 2) = 10. Both blue: C(4, 2) = 6. Favorable outcomes = 10 + 6 = 16. Probability = 16 / 36 = 4 / 9.',
            topic: 'Probability & Sampling',
            difficulty: 'easy',
            hint: 'P(Both Red) + P(Both Blue) = (5/9 * 4/8) + (4/9 * 3/8) = (20 + 12)/72 = 32/72 = 4/9.'
          },
          {
            id: 'quant-q10',
            text: 'Statements:\n1. All algorithms are processes.\n2. Some processes are heuristics.\nConclusions:\nI. Some algorithms are heuristics.\nII. No heuristic is an algorithm.',
            options: [
              'Neither conclusion I nor II definitively follows',
              'Only conclusion I follows',
              'Only conclusion II follows',
              'Both conclusions I and II follow'
            ],
            correctIndex: 0,
            type: 'single_choice',
            explanation: 'The middle term "processes" is not distributed in either premise. The subset of processes that are heuristics might overlap with algorithms, might be disjoint from algorithms, or might subsume them. Therefore, neither conclusion can be deduced with certainty.',
            topic: 'Deductive Logic',
            difficulty: 'medium',
            hint: 'Beware of the Fallacy of the Undistributed Middle in formal syllogisms.'
          }
        ]
      }
    ]
  }
];
