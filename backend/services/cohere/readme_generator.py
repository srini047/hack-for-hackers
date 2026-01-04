"""README.md generation using Cohere for text generation."""

from typing import Dict, Any, List
from services.cohere.client import CohereClient


class ReadmeGenerator:
    """Generate README.md files from project information using Cohere."""

    def __init__(self):
        """Initialize README generator with Cohere client."""
        self.client = CohereClient()

    def generate_readme(
        self,
        project_title: str,
        transcript: str,
        tech_stack: List[str],
        features: List[str],
        frame_descriptions: List[str],
    ) -> Dict[str, Any]:
        """
        Generate comprehensive README.md content using Cohere.

        Args:
            project_title: Project title
            transcript: Video transcript
            tech_stack: List of technologies
            features: List of features
            frame_descriptions: Descriptions from video frames

        Returns:
            Dictionary with README content and metadata
        """
        prompt = f"""Generate a professional README.md for a hackathon project based on this demo video information:

**Project Title:** {project_title}

**Video Transcript:**
{transcript[:2000]}  # Limit transcript length

**Technologies Used:** {', '.join(tech_stack)}

**Key Features:**
{chr(10).join(f'- {f}' for f in features)}

**Visual Context from Demo:**
{chr(10).join(frame_descriptions[:5])}  # Limit to 5 frames

Create a comprehensive README.md with these sections:
1. Title and brief tagline (one sentence)
2. Overview/Description (2-3 paragraphs about what the project does)
3. Features (expand on the key features with details)
4. Tech Stack (list with brief explanations)
5. Installation & Setup (create reasonable steps based on tech stack)
6. Usage (how to use the project)
7. Accessibility Features (highlight accessibility aspects)
8. Future Improvements (2-3 ideas)
9. Contributing (standard contributing section)
10. License (MIT)

IMPORTANT FORMATTING RULES:
- Use proper markdown formatting with headers (##), lists, and code blocks
- Make it professional and hackathon-ready
- DO NOT include placeholder text like "Add screenshots here"
- Only include real information from the provided context
- Use actual shell commands in code blocks (not pseudocode)
- Keep descriptions concise but informative

Return ONLY the markdown content, no preamble or explanation."""

        try:
            readme_content = self.client.generate_text(prompt, temperature=0.7)

            # Extract title and tagline
            title, tagline = self._extract_title_tagline(readme_content)

            return {
                "markdown": readme_content,
                "metadata": {
                    "title": title or project_title,
                    "tagline": tagline or "A hackathon project",
                    "tech_stack": tech_stack,
                    "features": features,
                },
            }
        except Exception as e:
            print(f"Error generating README with Cohere: {e}")
            # Return a basic template as fallback
            return self._create_fallback_readme(project_title, tech_stack, features)

    def _extract_title_tagline(self, readme_content: str) -> tuple:
        """
        Extract title and tagline from README content.

        Args:
            readme_content: Full README markdown

        Returns:
            Tuple of (title, tagline)
        """
        lines = readme_content.split("\n")
        title = None
        tagline = None

        for i, line in enumerate(lines):
            if line.startswith("# ") and not title:
                title = line.replace("# ", "").strip()
            elif (
                title
                and line.strip()
                and not line.startswith("#")
                and not line.startswith("**")
            ):
                tagline = line.strip()
                if len(tagline) > 10:  # Only use substantial lines
                    break

        return title, tagline

    def _create_fallback_readme(
        self, title: str, tech_stack: List[str], features: List[str]
    ) -> Dict[str, Any]:
        """
        Create a basic README template as fallback.

        Args:
            title: Project title
            tech_stack: Technologies used
            features: Project features

        Returns:
            Dictionary with basic README
        """
        tech_list = "\n".join(f"- {tech}" for tech in tech_stack)
        features_list = "\n".join(f"- {feature}" for feature in features)

        readme = f"""# {title}

A demo project showcasing innovative solutions with accessibility in mind.

## Overview

This project was built during a hackathon to solve real-world problems using modern technologies.

## Features

{features_list}

## Tech Stack

{tech_list}

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd {title.lower().replace(' ', '-')}

# Install dependencies
npm install  # or pip install -r requirements.txt

# Run the application
npm start    # or python main.py
```

## Usage

1. Start the application using the installation steps above
2. Access the interface at `http://localhost:3000`
3. Follow the on-screen instructions

## Accessibility Features

This project prioritizes accessibility:
- Screen reader compatible
- Keyboard navigation support
- High contrast mode
- WCAG 2.1 AA compliant

## Future Improvements

- Enhanced user interface
- Additional features based on user feedback
- Performance optimizations
- Extended platform support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning and development.
"""

        return {
            "markdown": readme,
            "metadata": {
                "title": title,
                "tagline": "A demo project showcasing innovative solutions",
                "tech_stack": tech_stack,
                "features": features,
            },
        }

    def generate_submission_content(
        self, readme_metadata: Dict[str, Any], transcript: str
    ) -> Dict[str, Any]:
        """
        Generate hackathon submission fields using Cohere with JSON response.

        Args:
            readme_metadata: Metadata from README
            transcript: Video transcript

        Returns:
            Dictionary with submission fields
        """
        prompt = f"""Based on this project information, generate hackathon submission content:

**Project Title:** {readme_metadata.get('title', 'Untitled Project')}
**Tagline:** {readme_metadata.get('tagline', 'A hackathon project')}
**Key Features:** {', '.join(readme_metadata.get('features', [])[:5])}
**Tech Stack:** {', '.join(readme_metadata.get('tech_stack', []))}

**Project Context from Video:**
{transcript[:1500]}

Generate the following fields for a hackathon submission:

1. **problem_statement**: A clear 2-3 sentence description of the problem this project solves
2. **solution**: A 2-3 sentence description of how the project solves the problem
3. **challenges**: A string with 3 technical challenges faced, separated by newlines
4. **whats_next**: A string with 3 future improvement ideas, separated by newlines

Make the content:
- Specific and relevant to the actual project
- Professional and clear
- Focused on the technical aspects
- Suitable for a hackathon submission

Return ONLY a JSON object with these exact keys: problem_statement, solution, challenges, whats_next"""

        # Define JSON schema for structured response
        schema = {
            "type": "object",
            "required": ["problem_statement", "solution", "challenges", "whats_next"],
            "properties": {
                "problem_statement": {
                    "type": "string",
                    "description": "2-3 sentences describing the problem",
                },
                "solution": {
                    "type": "string",
                    "description": "2-3 sentences describing the solution",
                },
                "challenges": {
                    "type": "string",
                    "description": "Technical challenges faced, separated by newlines",
                },
                "whats_next": {
                    "type": "string",
                    "description": "Future improvements, separated by newlines",
                },
            },
        }

        try:
            submission_data = self.client.generate_json(
                prompt=prompt, schema=schema, temperature=0.7
            )

            # Validate that all required fields are present
            required_fields = [
                "problem_statement",
                "solution",
                "challenges",
                "whats_next",
            ]
            if all(field in submission_data for field in required_fields):
                return submission_data
            else:
                print("Missing required fields in Cohere response, using fallback")
                return self._create_fallback_submission()

        except Exception as e:
            print(f"Error generating submission content with Cohere: {e}")
            return self._create_fallback_submission()

    def _create_fallback_submission(self) -> Dict[str, Any]:
        """
        Create fallback submission content.

        Returns:
            Dictionary with default submission fields
        """
        return {
            "problem_statement": "Many hackathon projects lack comprehensive documentation and accessibility features, making it difficult for judges and users to understand and evaluate the projects.",
            "solution": "This project provides an automated solution that generates professional documentation, subtitles, and audio descriptions from demo videos, making projects more accessible and easier to evaluate.",
            "challenges": "Integrating multiple AI services (Gemini Vision, Whisper, ElevenLabs)\nOptimizing video processing performance for real-time generation\nEnsuring WCAG 2.1 AA compliance across all generated content",
            "whats_next": "Add support for multiple languages in transcription and generation\nImplement real-time streaming for faster feedback\nIntegrate with popular hackathon platforms (Devpost, HackerEarth)",
        }
