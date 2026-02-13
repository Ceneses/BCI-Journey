# BCI Journey Questions

This folder contains all 1000 questions for the BCI Journey learning experience, organized by world.

## Structure

Each world has its own JSON file containing 100 questions:

- `world-1-brain-anatomy.json` - 100 questions about brain structure
- `world-2-brain-cells-electricity.json` - 100 questions about neurons and signals
- `world-3-bci-basics.json` - 100 questions about BCI fundamentals
- `world-4-hardware-electricity.json` - 100 questions about BCI equipment
- `world-5-brainwave-patterns.json` - 100 questions about brain signals
- `world-6-senses-messages.json` - 100 questions about sensory processing
- `world-7-helping-people.json` - 100 questions about medical applications
- `world-8-gaming-robots-fun.json` - 100 questions about entertainment and robotics
- `world-9-computer-magic.json` - 100 questions about algorithms and data
- `world-10-future-ethics.json` - 100 questions about ethics and future

## Question Format

Each question file follows this structure:

```json
{
  "worldId": 1,
  "questions": [
    {
      "id": 1,
      "question": "What is the largest part of the brain?"
    },
    {
      "id": 2,
      "question": "Which part of the brain helps you balance?"
    }
  ]
}
```

## Adding Questions

To add questions to a world:

1. Open the corresponding `world-X-name.json` file
2. Add question objects to the `questions` array
3. Ensure each question has a unique `id` within the world (1-100)
4. Write clear, engaging questions appropriate for young learners

## Question Guidelines

- Keep questions age-appropriate for young learners
- Use clear, simple language
- Make questions engaging and thought-provoking
- Each world should have exactly 100 questions
