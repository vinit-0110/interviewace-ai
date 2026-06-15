from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, SkillAssessment

skill_bp = Blueprint('skill', __name__)

# MCQ Question Pool for Skill Assessments
SKILL_TESTS = {
    "Python": [
        {
            "id": 1,
            "question": "Which of the following creates a tuple in Python?",
            "options": ["x = [1, 2]", "x = (1, 2)", "x = {1, 2}", "x = '1, 2'"],
            "answer": 1
        },
        {
            "id": 2,
            "question": "What is the primary role of the Python Global Interpreter Lock (GIL)?",
            "options": [
                "To speed up execution of multi-core CPU code",
                "To prevent multiple threads from executing Python bytecodes at once",
                "To compile Python code into machine instructions",
                "To manage garbage collection timing"
            ],
            "answer": 1
        },
        {
            "id": 3,
            "question": "Which method is called when an object is initialized in Python?",
            "options": ["__new__", "__init__", "__str__", "__del__"],
            "answer": 1
        },
        {
            "id": 4,
            "question": "What is the output of: print(type([])) in Python?",
            "options": ["<class 'tuple'>", "<class 'dict'>", "<class 'list'>", "<class 'set'>"],
            "answer": 2
        },
        {
            "id": 5,
            "question": "What does a Python decorator do?",
            "options": [
                "Formats string print statements",
                "Modifies a function or class behavior dynamically",
                "Deletes unused variables",
                "Imports libraries"
            ],
            "answer": 1
        }
    ],
    "Java": [
        {
            "id": 1,
            "question": "Which Java compiler target executes on client computers?",
            "options": ["JDK", "JRE", "JVM", "JAR"],
            "answer": 2
        },
        {
            "id": 2,
            "question": "Which keyword prevents a class from being inherited in Java?",
            "options": ["abstract", "final", "static", "private"],
            "answer": 1
        },
        {
            "id": 3,
            "question": "Where is an object reference stored in Java memory allocation?",
            "options": ["Heap memory", "Stack memory", "Method area", "GC cycle"],
            "answer": 1
        },
        {
            "id": 4,
            "question": "Which collection class is synchronized and thread-safe?",
            "options": ["HashMap", "ArrayList", "Vector", "HashSet"],
            "answer": 2
        },
        {
            "id": 5,
            "question": "Can abstract classes have constructors in Java?",
            "options": [
                "No, abstract classes cannot be instantiated",
                "Yes, they can have constructors to initialize fields",
                "Only private constructors are allowed",
                "Only default constructors are allowed"
            ],
            "answer": 1
        }
    ],
    "JavaScript": [
        {
            "id": 1,
            "question": "What is a closure in JavaScript?",
            "options": [
                "A library function that closes a database",
                "A function bundled together with references to its surrounding state",
                "A way to escape from loop blocks",
                "An event listener removal method"
            ],
            "answer": 1
        },
        {
            "id": 2,
            "question": "What is the difference between '==' and '===' in JavaScript?",
            "options": [
                "'==' checks value and type, while '===' only checks value",
                "'==' only checks value, while '===' checks both value and type",
                "There is no difference in JavaScript",
                "'===' is only used for strings"
            ],
            "answer": 1
        },
        {
            "id": 3,
            "question": "Which variable declaration is block-scoped in ES6?",
            "options": ["var", "let", "global", "declare"],
            "answer": 1
        },
        {
            "id": 4,
            "question": "What is the correct way to declare an asynchronous function in JS?",
            "options": ["async function foo() {}", "await function foo() {}", "function async foo() {}", "foo() = async => {}"],
            "answer": 0
        },
        {
            "id": 5,
            "question": "Which queue does Promise callback code enter in the JS Event Loop?",
            "options": ["Macrotask queue", "Microtask queue", "Call stack", "Thread pool"],
            "answer": 1
        }
    ],
    "React": [
        {
            "id": 1,
            "question": "What are the core rules of React Hooks?",
            "options": [
                "Can only call Hooks from React Function Components or Custom Hooks, and only at the top level",
                "Can call Hooks anywhere, including nested loops and conditions",
                "Must be declared inside render methods of class components",
                "Can only be called using the 'this' keyword"
            ],
            "answer": 0
        },
        {
            "id": 2,
            "question": "What is the purpose of the key prop in React lists?",
            "options": [
                "To encrypt elements for security",
                "To help React identify which items have changed, been added, or removed",
                "To apply specific CSS styling rules",
                "To count the number of elements"
            ],
            "answer": 1
        },
        {
            "id": 3,
            "question": "How do you perform side effects in functional components?",
            "options": ["useContext", "useState", "useEffect", "useMemo"],
            "answer": 2
        },
        {
            "id": 4,
            "question": "What does the Virtual DOM accomplish in React?",
            "options": [
                "Directly modifies browser DOM for speed",
                "Keeps a lightweight representation of UI in memory and syncs it with the real DOM via reconciliation",
                "Provides a server-side rendering library",
                "Creates a sandbox environment"
            ],
            "answer": 1
        },
        {
            "id": 5,
            "question": "How do you lift state up in React?",
            "options": [
                "Move the state to the parent component and pass it down via props",
                "Use the window.global variable",
                "Create a local database",
                "Call the forceUpdate() function"
            ],
            "answer": 0
        }
    ],
    "SQL": [
        {
            "id": 1,
            "question": "Which SQL join returns all rows from the left table and matched rows from the right table?",
            "options": ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "FULL OUTER JOIN"],
            "answer": 2
        },
        {
            "id": 2,
            "question": "Which aggregate function is used with GROUP BY to count items?",
            "options": ["SUM()", "COUNT()", "AVG()", "TOTAL()"],
            "answer": 1
        },
        {
            "id": 3,
            "question": "What does ACID stand for in Database Transactions?",
            "options": [
                "Atomicity, Consistency, Isolation, Durability",
                "Active, Checked, Index, Data",
                "Application, Client, Interface, Device",
                "Access, Control, Integrity, Distribution"
            ],
            "answer": 0
        },
        {
            "id": 4,
            "question": "What is the purpose of an INDEX in SQL databases?",
            "options": [
                "To secure tables from SQL injections",
                "To speed up data retrieval operations",
                "To link foreign keys",
                "To validate input constraints"
            ],
            "answer": 1
        },
        {
            "id": 5,
            "question": "Which SQL clause is used to filter records after aggregate groups are made?",
            "options": ["WHERE", "HAVING", "LIMIT", "ORDER BY"],
            "answer": 1
        }
    ],
    "Data Structures": [
        {
            "id": 1,
            "question": "Which data structure follows the LIFO (Last In, First Out) principle?",
            "options": ["Queue", "Stack", "Linked List", "Binary Tree"],
            "answer": 1
        },
        {
            "id": 2,
            "question": "What is the time complexity of searching in a perfectly balanced Binary Search Tree?",
            "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
            "answer": 2
        },
        {
            "id": 3,
            "question": "How does a Hash Map resolve collisions?",
            "options": [
                "Chaining (Linked Lists) or Open Addressing",
                "Creating a new database table",
                "Re-indexing the key array",
                "Stopping application execution"
            ],
            "answer": 0
        },
        {
            "id": 4,
            "question": "Which pointer references the next element in a singly-linked list node?",
            "options": ["prev", "next", "parent", "child"],
            "answer": 1
        },
        {
            "id": 5,
            "question": "What is a queue's insert operation called?",
            "options": ["pop", "push", "enqueue", "dequeue"],
            "answer": 2
        }
    ],
    "Algorithms": [
        {
            "id": 1,
            "question": "What is the average time complexity of the Quicksort algorithm?",
            "options": ["O(n)", "O(log n)", "O(n log n)", "O(n^2)"],
            "answer": 2
        },
        {
            "id": 2,
            "question": "Which search algorithm requires a sorted array to operate?",
            "options": ["Linear Search", "Binary Search", "Depth First Search", "Breadth First Search"],
            "answer": 1
        },
        {
            "id": 3,
            "question": "Which algorithm design paradigm is used by Dijkstra's shortest path algorithm?",
            "options": ["Divide and Conquer", "Greedy Algorithm", "Backtracking", "Dynamic Programming"],
            "answer": 1
        },
        {
            "id": 4,
            "question": "What is a primary characteristic of Dynamic Programming?",
            "options": [
                "Solves problems using random numbers",
                "Breaks down complex problems into overlapping subproblems and solves them using memoization",
                "Recursively sorts data using pivots",
                "Filters out duplicate items"
            ],
            "answer": 1
        },
        {
            "id": 5,
            "question": "What is the time complexity of a standard Bubble Sort in its worst case?",
            "options": ["O(log n)", "O(n)", "O(n log n)", "O(n^2)"],
            "answer": 3
        }
    ]
}

@skill_bp.route('/tests', methods=['GET'])
@jwt_required()
def get_tests():
    # Return available assessment categories
    return jsonify(list(SKILL_TESTS.keys())), 200

@skill_bp.route('/tests/<string:skill_name>', methods=['GET'])
@jwt_required()
def get_test_questions(skill_name):
    if skill_name not in SKILL_TESTS:
        return jsonify({"message": f"Test for '{skill_name}' not found."}), 404
        
    # Send questions without answer keys to prevent cheating
    questions = []
    for q in SKILL_TESTS[skill_name]:
        questions.append({
            "id": q["id"],
            "question": q["question"],
            "options": q["options"]
        })
        
    return jsonify({
        "skill": skill_name,
        "questions": questions
    }), 200

@skill_bp.route('/submit-assessment', methods=['POST'])
@jwt_required()
def submit_assessment():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    skill = data.get('skill', '').strip()
    answers = data.get('answers', {}) # Dict mapping question_id (str) -> selected_option_index (int)
    
    if not skill or skill not in SKILL_TESTS:
        return jsonify({"message": "Valid skill name is required."}), 400
        
    questions = SKILL_TESTS[skill]
    correct_count = 0
    total = len(questions)
    
    # Calculate score
    for q in questions:
        q_id_str = str(q["id"])
        if q_id_str in answers and int(answers[q_id_str]) == q["answer"]:
            correct_count += 1
            
    score_percentage = int((correct_count / total) * 100)
    
    # Classify level
    if score_percentage >= 80:
        level = "Advanced"
    elif score_percentage >= 50:
        level = "Intermediate"
    else:
        level = "Beginner"
        
    try:
        assessment = SkillAssessment(
            user_id=int(user_id),
            skill=skill,
            score=score_percentage,
            level=level
        )
        db.session.add(assessment)
        db.session.commit()
        
        return jsonify({
            "message": "Assessment completed.",
            "assessment": assessment.to_dict(),
            "correct_answers": correct_count,
            "total_questions": total
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to submit assessment.", "error": str(e)}), 500

@skill_bp.route('/assessments', methods=['GET'])
@jwt_required()
def get_assessments():
    user_id = get_jwt_identity()
    assessments = SkillAssessment.query.filter_by(user_id=int(user_id)).order_by(SkillAssessment.date.desc()).all()
    return jsonify([a.to_dict() for a in assessments]), 200
