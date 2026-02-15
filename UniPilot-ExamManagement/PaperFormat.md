Fetch the course_outcomes(COs) from the course_outcomes table matching the current course_id
Modify the paper_format column to be in following structure.

{
  // List of all components in the paper (checked + unchecked)
  "components": [
    {
      // Unique Component that we're already fetching from the cycle type
      "component_id": "PART_A",

    // Whether this component is enabled (checked) or not
      "is_checked": true,

    // Only applicable if is_checked = true
      "sections": [
        {
          // Section identifier (ex: Section 1, Section A)
          "section_id": "SECTION_1",

    // Total number of questions defined in this section
          "total_questions": 5,

    // Number of questions student must answer
          "questions_to_answer": 3,

    // Total maximum marks allotted for this section
          // MUST equal sum of max_marks of all questions in this section
          "max_marks": 30,

    "questions": [
            {
              // Main question number
              "question_number": "1",

    // Maximum marks for this question
              // If sub_parts exist, this MUST equal sum of all sub_part max_marks
              "max_marks": 10,

    // Course Outcome ID this question maps to
              "co_id": "CO1",

    // Optional: present only if question has sub parts
              "sub_parts": [
                {
                  "question_number": "1a",
                  "max_marks": 5
                },
                {
                  "question_number": "1b",
                  "max_marks": 5
                }
              ]
            },
            {
              "question_number": "2",
              "max_marks": 10,
              "co_id": "CO2"
              // No sub_parts means entire 10 marks for this single question
            },
            {
              "question_number": "3",
              "max_marks": 10,
              "co_id": "CO3"
            }
          ]
        }
      ]
    },

    {
      // Example of unchecked component
      "component_id": "PART_C",

    "is_checked": false,

    // For unchecked components, only max_marks is required
      "max_marks": 20
    }
  ]
}

In the UI
component ids - we already fetching and display
is_check is a checkbox
question_numbers should be a string input
max_marks input of type number

🔎 Important Validation Rules

Your system must validate these:

1️⃣ Sub-Part Rule
SUM(sub_parts.max_marks) == question.max_marks

2️⃣ Answer Constraint Rule
questions_to_answer <= total_questions

3️⃣ Unchecked Component Rule

If:

is_checked = false

Then:

sections MUST NOT exist
Only max_marks is allowed
