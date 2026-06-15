import os
import json
import random
from openai import OpenAI

# Initialize the OpenAI client (will fail gracefully if no API key is provided)
def get_openai_client():
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if api_key:
        try:
            return OpenAI(api_key=api_key)
        except Exception:
            return None
    return None

# Preset fallback questions for different domains and difficulties
PRESET_QUESTIONS = {
    "Python": {
        "Beginner": [
            "What is the difference between a list and a tuple in Python?",
            "How does memory management work in Python?",
            "What are decorators in Python and how do you use them?",
            "Explain the difference between 'is' and '==' in Python.",
            "What is a dictionary comprehension and can you give an example?",
            "What are Python generator functions and how do they differ from normal functions?",
            "Explain the difference between local and global variables in Python.",
            "What is the purpose of the 'self' parameter in Python class methods?",
            "How do you handle exceptions in Python using try-except-finally blocks?",
            "What are lambda functions in Python and when should you use them?"
        ],
        "Intermediate": [
            "Explain the difference between deep copy and shallow copy in Python.",
            "What is the difference between generator and iterator in Python?",
            "Explain the global interpreter lock (GIL) in Python and its impact on multi-threading.",
            "How do *args and **kwargs work in Python functions?",
            "What are metaclasses in Python and when would you use them?",
            "Explain python's memory management and how garbage collection is implemented.",
            "How do you implement a decorator that accepts arguments?",
            "What is the difference between threading and multiprocessing in Python?",
            "Explain how the 'with' statement works under the hood (context managers).",
            "What is monkey patching in Python and when is it useful?"
        ],
        "Advanced": [
            "Explain Python's Method Resolution Order (MRO) and how it handles multiple inheritance.",
            "How does garbage collection work in Python under the hood?",
            "Describe how to implement a custom context manager without using the contextlib module.",
            "How would you optimize a memory-heavy, CPU-bound Python script utilizing multiprocessing or asyncio?",
            "Explain the descriptor protocol in Python and how it relates to properties and methods.",
            "What are coroutines in Python and how does the event loop execute asyncio tasks?",
            "Explain the difference between __new__ and __init__ methods in Python class creation.",
            "How would you implement a custom dictionary class that acts like a default dictionary using magic methods?",
            "Detail how memory slots work in Python classes using __slots__.",
            "Explain the use of abstract base classes (ABCs) and how to register virtual subclasses."
        ]
    },
    "Java": {
        "Beginner": [
            "What is the difference between JDK, JRE, and JVM?",
            "Explain the concepts of OOP (Object-Oriented Programming) in Java.",
            "What is the difference between 'equals()' method and '==' operator in Java?",
            "Explain the 'final', 'finally', and 'finalize' keywords in Java.",
            "What is the difference between ArrayList and LinkedList?",
            "What is method overloading vs method overriding in Java?",
            "Explain the use of the 'static' keyword in Java variables and methods.",
            "What is the purpose of a constructor in Java?",
            "What are wrapper classes in Java and what is autoboxing/unboxing?",
            "What is the difference between string, stringbuilder, and stringbuffer in Java?"
        ],
        "Intermediate": [
            "Explain the Java Exception Hierarchy. What is the difference between checked and unchecked exceptions?",
            "How does Garbage Collection work in Java? Describe different GC algorithms.",
            "What is the difference between Interface and Abstract Class in Java 8+?",
            "What is the Java Memory Model? Explain Stack vs Heap memory.",
            "Explain the concept of synchronization and how the 'synchronized' keyword works.",
            "What is the Java Reflection API and how is it used?",
            "Explain generics in Java and the concept of type erasure.",
            "What is the difference between fail-fast and fail-safe iterators in Java collections?",
            "What are lambda expressions and functional interfaces introduced in Java 8?",
            "How does the Stream API work in Java and what is the difference between intermediate and terminal operations?"
        ],
        "Advanced": [
            "Explain how ConcurrentHashMap achieves high performance and thread safety in Java.",
            "What are Java ClassLoaders? Explain the delegation model and custom class loaders.",
            "Explain the difference between optimistic locking and pessimistic locking in Java databases.",
            "Describe the ForkJoinPool and how it is used in Parallel Streams.",
            "How do you profile a Java application to detect memory leaks and CPU bottlenecks?",
            "Explain phantom, weak, and soft references in Java and their garbage collection behavior.",
            "What is Java agent development and how is instrumentation used?",
            "How does the JVM Just-In-Time (JIT) compiler optimize code execution at runtime?",
            "Explain memory barriers and volatile variable visibility rules in the Java Memory Model.",
            "How do you design a custom classloader to load classes dynamically from an encrypted file?"
        ]
    },
    "C++": {
        "Beginner": [
            "What are pointers and references in C++? How do they differ?",
            "Explain the difference between stack and heap memory allocation in C++.",
            "What is function overloading and operator overloading in C++?",
            "Explain the purpose of the 'const' keyword in C++.",
            "What is the difference between structures and classes in C++?",
            "What is a namespace in C++ and how do you use it?",
            "Explain the purpose of 'std::cin' and 'std::cout' in C++.",
            "What is a constructor and destructor in C++?",
            "What are access specifiers (public, private, protected) in C++?",
            "What is the difference between static and dynamic allocation in C++?"
        ],
        "Intermediate": [
            "What are Smart Pointers in C++11? Explain unique_ptr, shared_ptr, and weak_ptr.",
            "Explain virtual functions and polymorphism in C++. What is a VTABLE?",
            "What is RAII (Resource Acquisition Is Initialization) in C++?",
            "What is the difference between malloc/free and new/delete in C++?",
            "Explain template metaprogramming in C++ and its advantages.",
            "What are lambda functions in C++11 and how do capture lists work?",
            "Explain copy constructors vs assignment operators, and rule of three/five.",
            "What is the Standard Template Library (STL) in C++ and its key components?",
            "Explain the difference between std::map (red-black tree) and std::unordered_map (hash table).",
            "What is the purpose of 'const_cast', 'static_cast', 'dynamic_cast', and 'reinterpret_cast'?"
        ],
        "Advanced": [
            "Explain Move Semantics and Rvalue References in C++11. How does std::move work?",
            "Describe the memory layout of a C++ object with multiple virtual inheritance.",
            "What is undefined behavior in C++? Give examples and explain how to prevent it.",
            "Explain inline functions, external linkage, and how compiler optimization affects C++ executables.",
            "How do you implement a custom lock-free queue in C++?",
            "What is template specialization and SFINAE (Substitution Failure Is Not An Error) in C++?",
            "Explain the C++ memory model, atomic operations, and sequential consistency vs relaxed memory order.",
            "How do you optimize cache locality in high-performance C++ applications?",
            "Detail how placement new works in C++ and when it should be used.",
            "What is the difference between compile-time evaluation using constexpr and consteval in C++20?"
        ]
    },
    "Web Development": {
        "Beginner": [
            "What is the DOM and how does it work in browsers?",
            "Explain the difference between GET and POST HTTP methods.",
            "What is the box model in CSS?",
            "What is the difference between 'let', 'const', and 'var' in JavaScript?",
            "What are semantic HTML tags and why are they important?",
            "Explain the difference between client-side validation and server-side validation.",
            "What is the purpose of CSS flexbox and how does it align items?",
            "What are media queries in CSS and how are they used for responsive design?",
            "What is the difference between local storage, session storage, and cookies?",
            "What is JSON and how do you parse/stringify it in JavaScript?"
        ],
        "Intermediate": [
            "Explain CORS (Cross-Origin Resource Sharing) and how to resolve CORS errors.",
            "What are WebSockets and how do they differ from HTTP polling?",
            "Explain how the event loop works in JavaScript (microtasks and macrotasks).",
            "What is the difference between Client-Side Rendering (CSR) and Server-Side Rendering (SSR)?",
            "Explain CSS Grid vs Flexbox and when to use which.",
            "What is the difference between authentication and authorization in web security?",
            "What is JavaScript closure and can you give a practical example?",
            "Explain JavaScript promises, async/await, and error handling in async workflows.",
            "What is the Virtual DOM and how does React use it to optimize rendering?",
            "Explain state management in React and when to use context API vs state libraries."
        ],
        "Advanced": [
            "Describe the critical rendering path of a web page and how to optimize it for speed.",
            "Explain Web Workers and how they can be used to run heavy tasks off the main JS thread.",
            "Explain OAuth 2.0 flow and how to secure JWTs in single-page applications.",
            "How would you build a micro-frontend architecture? What are the key challenges?",
            "Detail browser caching strategies (Cache-Control, ETag, Service Workers).",
            "Explain Server-Sent Events (SSE) vs WebSockets and when to use which.",
            "What are web components (Shadow DOM, Custom Elements, HTML Templates) and how do they work?",
            "How do you perform memory analysis during malware investigation? Detail tools and indicators.",
            "Explain the mechanics of Active Directory security exploitation (Kerberoasting, Golden Tickets).",
            "How do you configure absolute security headers (HSTS, CSP, CORS, X-Frame-Options) to secure a frontend app?",
            "Explain how homomorphic encryption works and how it allows computation on encrypted data."
        ]
    },
    "AI/ML": {
        "Beginner": [
            "What is the difference between Supervised and Unsupervised Learning?",
            "Explain the concept of Overfitting and how to prevent it.",
            "What is Gradient Descent and how does it work?",
            "Explain the difference between Classification and Regression.",
            "What is a confusion matrix and what metrics can you derive from it?",
            "What are features and targets in a machine learning dataset?",
            "Explain the difference between training set, validation set, and test set.",
            "What is K-Nearest Neighbors (KNN) algorithm and how does it classify data?",
            "What is a Decision Tree and how does it make choices?",
            "What is linear regression and how does it find the line of best fit?"
        ],
        "Intermediate": [
            "Explain the bias-variance tradeoff in Machine Learning.",
            "How do Convolutional Neural Networks (CNNs) work, specifically pooling and convolution layers?",
            "What is the difference between L1 and L2 regularization?",
            "Explain the architecture of a Recurrent Neural Network (RNN) and its vanishing gradient problem.",
            "What is Random Forest? How does it differ from Decision Trees?",
            "What is K-Means clustering and how do you choose the value of 'K' using the elbow method?",
            "Explain Support Vector Machines (SVM) and the concept of maximum margin.",
            "What is a ROC curve and Area Under the Curve (AUC) in classification evaluation?",
            "Explain cross-validation and why it is useful for model evaluation.",
            "What is principal component analysis (PCA) and how does it reduce feature count?"
        ],
        "Advanced": [
            "Explain the Transformer architecture, specifically Self-Attention, Multi-head Attention, and Positional Encoding.",
            "Describe the concept of Generative Adversarial Networks (GANs) and how their loss functions work.",
            "How does reinforcement learning work? Explain Q-learning vs Policy Gradient methods.",
            "What is the difference between Fine-tuning, Prompt Engineering, and RAG (Retrieval-Augmented Generation) in LLMs?",
            "How do you debug a neural network that is not converging or has exploding gradients?",
            "Explain contrastive learning and self-supervised learning algorithms.",
            "Detail how optimization algorithms like Adam, RMSprop, and SGD differ mathematically.",
            "What is Neural Architecture Search (NAS) and how does it automate ML design?",
            "Explain model quantization, pruning, and knowledge distillation for edge deployment.",
            "Detail the math behind backpropagation in neural networks with multiple layers."
        ]
    },
    "Data Science": {
        "Beginner": [
            "What is the difference between Data Science, Data Analytics, and Big Data?",
            "Explain the difference between structured and unstructured data.",
            "What is the Central Limit Theorem and why is it important?",
            "What is normal distribution and how do you test for it?",
            "What are outliers and how do you handle them in a dataset?",
            "What is SQL and why is it essential for data science?",
            "What is pandas in Python and how do you read a CSV file into a DataFrame?",
            "What are mean, median, and mode? When is median preferred over mean?",
            "What is data visualization and what tools (e.g., matplotlib, seaborn) do you use?",
            "Explain what a correlation coefficient (r) represents."
        ],
        "Intermediate": [
            "Explain A/B testing, statistical significance, and p-value calculation.",
            "What is feature engineering? Provide three common techniques.",
            "What is PCA (Principal Component Analysis) and how does it reduce dimensionality?",
            "Explain the difference between covariance and correlation.",
            "How do you handle imbalanced datasets for classification tasks?",
            "Explain the difference between Type I and Type II errors in hypothesis testing.",
            "What is the difference between inner join, left join, right join, and full outer join in SQL?",
            "Explain regularization and its importance in regression models.",
            "What is collinearity and multi-collinearity, and how do they affect model metrics?",
            "Explain the difference between parametric and non-parametric statistical tests."
        ],
        "Advanced": [
            "Explain the mathematical foundation of Support Vector Machines (SVM) and the kernel trick.",
            "Describe how to design and evaluate a recommendation engine (collaborative vs content-based).",
            "Explain Time Series forecasting. What is ARIMA and how does it differ from LSTM models?",
            "How do you scale data pipelines using Apache Spark? Detail MapReduce and Resilient Distributed Datasets (RDDs).",
            "Explain Bayesian Inference and how it differs from Frequentist Statistics.",
            "Describe the design of a real-time data streaming pipeline using Kafka and Spark Streaming.",
            "How does target encoding work and what are the risks of using it without regularizers?",
            "Detail the mathematics of XGBoost and how it implements gradient boosting trees.",
            "What is causal inference and how do you use propensity score matching to establish causality?",
            "How do you design a database indexing strategy for a query-heavy analytics dashboard?"
        ]
    },
    "Cyber Security": {
        "Beginner": [
            "What is the difference between Symmetric and Asymmetric Encryption?",
            "Explain the CIA Triad (Confidentiality, Integrity, Availability).",
            "What is a Phishing attack and how can users prevent it?",
            "What is a Firewall and how does it work?",
            "Explain the difference between HTTP and HTTPS.",
            "Social engineering and what are common tactics?",
            "What is malware and what are the main types (e.g., virus, worm, trojan)?",
            "What is the purpose of a VPN (Virtual Private Network)?",
            "What is a vulnerability assessment vs a penetration test?",
            "What is password complexity and why is it important?"
        ],
        "Intermediate": [
            "Explain SQL Injection (SQLi) and Cross-Site Scripting (XSS). How do you mitigate them?",
            "What is a Man-in-the-Middle (MitM) attack and how does TLS prevent it?",
            "Explain the difference between IDS (Intrusion Detection System) and IPS (Intrusion Prevention System).",
            "What is multi-factor authentication (MFA) and what are its main implementation options?",
            "What is Salting in password hashing and why is it crucial?",
            "Explain the difference between stateless and stateful firewalls.",
            "What is DNS spoofing (cache poisoning) and how does it redirect users?",
            "Explain the principle of least privilege (PoLP) and how it reduces security risks.",
            "What is a DDOS (Distributed Denial of Service) attack and how can it be mitigated?",
            "What is endpoint security and how does it differ from network security?"
        ],
        "Advanced": [
            "Describe the Zero Trust Architecture model and its core implementation principles.",
            "Explain Buffer Overflow attacks and how modern operating systems defend against them (ASLR, DEP).",
            "What is DNSSEC? How does it protect the Domain Name System from spoofing?",
            "Describe the process of a penetration test and the difference between black box, white box, and grey box testing.",
            "Explain cryptographic side-channel attacks and how developers can prevent them in software.",
            "Detail the handshake protocol of TLS 1.3 and how it improves speed and security over TLS 1.2.",
            "How do you perform memory analysis during malware investigation? Detail tools and indicators.",
            "Explain the mechanics of Active Directory security exploitation (Kerberoasting, Golden Tickets).",
            "How do you configure absolute security headers (HSTS, CSP, CORS, X-Frame-Options) to secure a frontend app?",
            "Explain how homomorphic encryption works and how it allows computation on encrypted data."
        ]
    },
    "HR Interview": {
        "Beginner": [
            "Tell me about yourself.",
            "Why do you want to join our company?",
            "What are your greatest strengths and weaknesses?",
            "Where do you see yourself in 5 years?",
            "Describe a time you had to work in a team to achieve a goal.",
            "Why did you choose your field of study?",
            "What motivates you to work hard every day?",
            "How do you handle stress or tight schedules?",
            "What do you know about our company culture?",
            "What are your hobbies and interests outside of work?"
        ],
        "Intermediate": [
            "Describe a difficult challenge you faced at work/university and how you overcame it.",
            "How do you handle conflict with a colleague or team member?",
            "Tell me about a time you failed. What did you learn?",
            "How do you manage tight deadlines and prioritize your work?",
            "Why should we hire you over other candidates?",
            "Explain how you handle working under a manager with a micro-managing style.",
            "Tell me about a time you had to learn a new technology or skill quickly.",
            "How do you handle critical feedback from team members?",
            "Describe a situation where you had to go above and beyond your standard duties.",
            "What are your salary expectations and how did you calculate them?"
        ],
        "Advanced": [
            "Describe a situation where you had to lead a project with limited guidance. How did you succeed?",
            "How do you handle negative feedback from a manager or client?",
            "Tell me about a time when you persuaded a senior stakeholder to change their perspective.",
            "Describe a major career transition or difficult decision you made and your decision-making process.",
            "How do you keep yourself motivated and updated in this rapidly changing technological landscape?",
            "How do you handle ethical dilemmas in your workspace or software engineering decisions?",
            "Describe how you would manage a team member who is underperforming. What steps would you take?",
            "Tell me about a time you had to pivot a project mid-way due to sudden business goal changes.",
            "How do you evaluate success in your career and within projects you lead?",
            "What is your philosophy on leadership and how do you implement it in engineering teams?"
        ]
    }
}

class AIService:
    @staticmethod
    def generate_questions(domain, difficulty, count=5):
        client = get_openai_client()
        
        # Format names slightly to match standard keys
        domain_key = domain
        if domain not in PRESET_QUESTIONS:
            # Fallback mapping if domain string is slightly different
            for key in PRESET_QUESTIONS.keys():
                if key.lower() in domain.lower() or domain.lower() in key.lower():
                    domain_key = key
                    break
        
        if domain_key not in PRESET_QUESTIONS:
            domain_key = "Python"  # Default fallback
            
        difficulty_key = difficulty if difficulty in ["Beginner", "Intermediate", "Advanced"] else "Beginner"
        
        # If client is configured, try calling OpenAI API
        if client:
            try:
                prompt = (
                    f"Generate {count} unique, high-quality, professional interview questions for the domain '{domain}' "
                    f"at a '{difficulty}' level. Return ONLY a JSON object containing a 'questions' list, where each element "
                    f"has keys 'category', 'difficulty', and 'question'. Do not output markdown code blocks or extra text, just raw JSON."
                )
                
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a senior technical interviewer and HR executive."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    response_format={"type": "json_object"}
                )
                
                data = json.loads(response.choices[0].message.content)
                if "questions" in data and len(data["questions"]) > 0:
                    return data["questions"][:count]
            except Exception as e:
                print(f"OpenAI error in generate_questions: {e}. Falling back to preset questions.")
        
        # Local Heuristic Fallback
        # Query database questions first, falling back to PRESET_QUESTIONS if not enough/empty
        try:
            from models import Question
            db_questions = Question.query.filter_by(category=domain_key, difficulty=difficulty_key).all()
            if db_questions:
                # We can sample from the database questions
                selected = random.sample(db_questions, min(count, len(db_questions)))
                questions_list = []
                for q in selected:
                    questions_list.append({
                        "category": q.category,
                        "difficulty": q.difficulty,
                        "question": q.question
                    })
                # If we have enough, return them
                if len(questions_list) >= count:
                    return questions_list
                # Otherwise, pad with presets if needed (or just return what we have)
                presets = PRESET_QUESTIONS[domain_key][difficulty_key]
                for p in presets:
                    if len(questions_list) >= count:
                        break
                    # Avoid duplicates
                    if not any(q['question'] == p for q in questions_list):
                        questions_list.append({
                            "category": domain_key,
                            "difficulty": difficulty_key,
                            "question": p
                        })
                return questions_list
        except Exception as db_err:
            print(f"Database error fetching questions: {db_err}")
            
        presets = PRESET_QUESTIONS[domain_key][difficulty_key]
        selected = random.sample(presets, min(count, len(presets)))
        
        # If count exceeds available presets, duplicate or pad
        questions_list = []
        for q in selected:
            questions_list.append({
                "category": domain_key,
                "difficulty": difficulty_key,
                "question": q
            })
            
        return questions_list

    @staticmethod
    def evaluate_answer(question_text, user_answer):
        client = get_openai_client()
        
        # Minimum answer check
        if not user_answer or len(user_answer.strip()) < 5:
            return {
                "score": 10,
                "accuracy": 5,
                "technical_depth": 5,
                "communication": 20,
                "clarity": 10,
                "grammar": 30,
                "relevance": 5,
                "feedback_strengths": "Answer provided is too short to evaluate properly.",
                "feedback_weaknesses": "No substantial text provided. Answering with single words or empty text does not show knowledge.",
                "suggested_answer": "Please provide a detailed paragraph answering the question directly.",
                "improvement_tips": "Write at least 2-3 sentences explaining the core concept, its benefits, and an example."
            }
            
        if client:
            try:
                system_prompt = (
                    "You are an AI interviewer assessing a candidate's answer. Assess it across 6 criteria on a 0-100 scale: "
                    "accuracy, technical_depth, communication, clarity, grammar, and relevance. "
                    "Return a JSON object containing: "
                    "- score: average overall score (0-100)\n"
                    "- accuracy: (0-100)\n"
                    "- technical_depth: (0-100)\n"
                    "- communication: (0-100)\n"
                    "- clarity: (0-100)\n"
                    "- grammar: (0-100)\n"
                    "- relevance: (0-100)\n"
                    "- feedback_strengths: list of strengths as a string\n"
                    "- feedback_weaknesses: list of weaknesses as a string\n"
                    "- suggested_answer: a high-quality model response\n"
                    "- improvement_tips: actionable advice to improve\n"
                    "Return ONLY raw JSON."
                )
                
                user_prompt = f"Question: {question_text}\nCandidate's Answer: {user_answer}"
                
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.5,
                    response_format={"type": "json_object"}
                )
                
                return json.loads(response.choices[0].message.content)
            except Exception as e:
                print(f"OpenAI error in evaluate_answer: {e}. Falling back to local NLP heuristic.")
                
        # Local NLP / Heuristic Evaluation
        # Simple string heuristics: length, keyword checks, sentence count
        word_count = len(user_answer.split())
        sentence_count = max(1, user_answer.count('.') + user_answer.count('?') + user_answer.count('!'))
        
        # Check for technical jargon based on keywords in the question
        tech_keywords = ["list", "tuple", "memory", "decorator", "equals", "polymorphism", "pointer", "reference", "oop", "jwt", "cors", "database", "sql"]
        keyword_score = 0
        for kw in tech_keywords:
            if kw in user_answer.lower():
                keyword_score += 15
        keyword_score = min(75, keyword_score + 15)
        
        # Calculate heuristics
        accuracy = min(95, max(30, keyword_score + (word_count // 3)))
        tech_depth = min(90, max(25, (word_count // 2)))
        communication = min(95, max(40, 50 + (sentence_count * 5)))
        clarity = min(90, max(40, 60 if word_count > 15 else 40))
        grammar = min(95, max(50, 80 - (sentence_count % 3) * 5))
        relevance = min(98, max(30, 40 + (keyword_score)))
        
        overall_score = int((accuracy + tech_depth + communication + clarity + grammar + relevance) / 6)
        
        # Construct strengths & weaknesses dynamically
        strengths = []
        weaknesses = []
        tips = []
        
        if word_count > 30:
            strengths.append("Provided a detailed explanation with decent length.")
        else:
            weaknesses.append("The answer is brief. Try adding more examples or context.")
            tips.append("Expand your answer to explain 'why' and 'how' rather than just 'what'.")
            
        if keyword_score > 40:
            strengths.append("Demonstrated familiarity with key technical terms.")
        else:
            weaknesses.append("Lacks technical keywords and depth.")
            tips.append("Mention specific syntax, libraries, or architectural components related to the question.")
            
        if sentence_count > 2:
            strengths.append("Structured the response into multiple distinct sentences.")
        else:
            weaknesses.append("Very simple sentence structure; could use better transition phrases.")
            tips.append("Use bullet points or structured logical sequencing (First, Second, Finally).")
            
        if not strengths:
            strengths.append("Response is readable and addresses the question.")
        if not weaknesses:
            weaknesses.append("Could include more code examples or real-world use cases.")
            tips.append("Always try to provide a concrete scenario or project where you implemented this concept.")
            
        # Preset suggested answers for some common topics
        suggested = "In a standard environment, this concept is implemented by configuring the core architecture correctly, ensuring security compliance, and following design patterns. For instance, in real-world scenarios, it prevents resource leaks, optimizes run-time, and guarantees thread-safety or isolation."
        
        # Refine suggested answer based on question keywords
        lower_q = question_text.lower()
        if "list" in lower_q and "tuple" in lower_q:
            suggested = "Lists are mutable, meaning their elements can be changed after creation, and are defined with brackets []. Tuples are immutable, defined with parentheses (), and are faster/consume less memory, making them ideal for read-only data."
        elif "decorator" in lower_q:
            suggested = "A decorator in Python is a design pattern that allows you to modify the behavior of a function or class. It takes a function as an argument, extends its behavior without modifying it, and returns a new function. Syntax is denoted with '@decorator_name'."
        elif "polymorphism" in lower_q:
            suggested = "Polymorphism is the ability of different classes to respond to the same message (method call) in their own unique way. In Java/C++, this is typically achieved through method overriding (runtime) and method overloading (compile-time)."
        elif "pointer" in lower_q:
            suggested = "A pointer stores the direct memory address of a variable, whereas a reference is an alias (another name) for an existing variable. Pointers can be null, reassigned, and require dereferencing, while references cannot be null or reassigned."
            
        return {
            "score": overall_score,
            "accuracy": int(accuracy),
            "technical_depth": int(tech_depth),
            "communication": int(communication),
            "clarity": int(clarity),
            "grammar": int(grammar),
            "relevance": int(relevance),
            "feedback_strengths": " • " + "\n • ".join(strengths),
            "feedback_weaknesses": " • " + "\n • ".join(weaknesses),
            "suggested_answer": suggested,
            "improvement_tips": " • " + "\n • ".join(tips)
        }

    @staticmethod
    def generate_roadmap(weak_areas, skill):
        client = get_openai_client()
        
        # Clean up weak areas list
        weak_list = [w.strip() for w in weak_areas.split(",") if w.strip()]
        if not weak_list:
            weak_list = ["Core Syntax", "Design Patterns", "Data Handling"]
            
        if client:
            try:
                system_prompt = (
                    "You are a career development coach and technical tutor. Generate a study roadmap. "
                    "Return ONLY a JSON object containing:\n"
                    "- recommended_topics: list of strings\n"
                    "- practice_questions: list of strings\n"
                    "- free_resources: list of objects with keys 'name', 'url', 'type'\n"
                    "- weekly_study_plan: list of objects with keys 'week', 'focus', 'tasks'\n"
                    "Return ONLY raw JSON."
                )
                
                user_prompt = f"Skill/Domain: {skill}\nWeak Areas: {', '.join(weak_list)}"
                
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.6,
                    response_format={"type": "json_object"}
                )
                return json.loads(response.choices[0].message.content)
            except Exception as e:
                print(f"OpenAI error in generate_roadmap: {e}. Falling back to local template.")
                
        # Local mock roadmap generator
        recommended_topics = [f"Deep dive into {w}" for w in weak_list] + [f"Best practices in {skill} architecture", f"Interview-level algorithms for {skill}"]
        
        practice_questions = [
            f"Explain how you would optimize a slow component handling {weak_list[0] if len(weak_list) > 0 else 'core syntax'}.",
            f"What are the common antipatterns or security risks when implementing {weak_list[-1]}?",
            f"Write a short, clean code segment demonstrating your solution to {weak_list[0] if len(weak_list) > 0 else 'a core problem'}."
        ]
        
        free_resources = [
            {"name": f"Official {skill} Documentation", "url": f"https://www.google.com/search?q=official+{skill.lower()}+documentation", "type": "Documentation"},
            {"name": f"Learn {skill} in Y Minutes", "url": f"https://learnxinyminutes.com/", "type": "Quick Guide"},
            {"name": f"Awesome {skill} Resources (GitHub)", "url": "https://github.com", "type": "GitHub Repository"}
        ]
        
        weekly_study_plan = [
            {
                "week": "Week 1: Fundamentals & Theory",
                "focus": f"Mastering {weak_list[0] if len(weak_list) > 0 else 'core concepts'}",
                "tasks": [
                    f"Read chapters on {weak_list[0] if len(weak_list) > 0 else 'basic rules'}",
                    "Complete 5 coding exercises or conceptual reviews",
                    "Write a summaries guide about this topic"
                ]
            },
            {
                "week": "Week 2: Advanced Logic",
                "focus": f"Applying {weak_list[-1]} and integration",
                "tasks": [
                    "Build a miniature mock project integrating this concept",
                    "Perform code reviews of open-source implementations",
                    "Conduct a practice test on InterviewAce AI"
                ]
            },
            {
                "week": "Week 3: Interview Optimization",
                "focus": "Polishing delivery, clarity, and time bounds",
                "tasks": [
                    "Practice answering questions under a 2-minute timer",
                    "Analyze memory and CPU footprint of your solutions",
                    "Perform a full simulation HR + Tech interview"
                ]
            }
        ]
        
        return {
            "recommended_topics": recommended_topics,
            "practice_questions": practice_questions,
            "free_resources": free_resources,
            "weekly_study_plan": weekly_study_plan
        }
