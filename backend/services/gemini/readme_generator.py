"""README.md generation using Gemini (synchronous)."""
from typing import Dict, Any, List
from services.gemini.client import GeminiClient


class ReadmeGenerator:
    """Generate README.md files from project information."""
    
    def __init__(self):
        """Initialize README generator."""
        self.client = GeminiClient()
    
    def generate_readme(
        self,
        project_title: str,
        transcript: str,
        tech_stack: List[str],
        features: List[str],
        frame_descriptions: List[str]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive README.md content.
        
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
{transcript}

**Technologies Used:** {', '.join(tech_stack)}

**Key Features:**
{chr(10).join(f'- {f}' for f in features)}

**Visual Context from Demo:**
{chr(10).join(frame_descriptions)}

Create a comprehensive README.md with these sections:
1. Title and brief tagline
2. Overview/Description (2-3 paragraphs about what the project does)
3. Features (expand on the key features with details)
4. Tech Stack (list with brief explanations)
5. Installation & Setup (create reasonable steps)
6. Usage (how to use the project)
7. Accessibility Features (this is important - highlight accessibility aspects)
8. Future Improvements
9. Contributing
10. License (MIT)

Make it professional, clear, and hackathon-ready. Use proper markdown formatting with headers, lists, and code blocks where appropriate.
DO NOT include placeholder text like "Add screenshots here" - only include real information."""

        try:
            readme_content = self.client.generate_text(prompt)
            
            # Extract title and tagline
            title, tagline = self._extract_title_tagline(readme_content)
            
            return {
                "markdown": readme_content,
                "metadata": {
                    "title": title or project_title,
                    "tagline": tagline,
                    "tech_stack": tech_stack,
                    "features": features
                }
            }
        except Exception as e:
            print(f"Error generating README: {e}")
            # Return a basic template as fallback
            return self._create_fallback_readme(
                project_title,
                tech_stack,
                features
            )
    
    def _extract_title_tagline(self, readme_content: str) -> tuple:
        """
        Extract title and tagline from README content.
        
        Args:
            readme_content: Full README markdown
        
        Returns:
            Tuple of (title, tagline)
        """
        lines = readme_content.split('\n')
        title = None
        tagline = None
        
        for i, line in enumerate(lines):
            if line.startswith('# ') and not title:
                title = line.replace('# ', '').strip()
            elif title and line.strip() and not line.startswith('#'):
                tagline = line.strip()
                break
        
        return title, tagline
    
    def _create_fallback_readme(
        self,
        title: str,
        tech_stack: List[str],
        features: List[str]
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
        tech_list = '\n'.join(f'- {tech}' for tech in tech_stack)
        features_list = '\n'.join(f'- {feature}' for feature in features)
        
        readme = f"""# {title}

An accessible demo project for hackathons.

## Features

{features_list}

## Tech Stack

{tech_list}

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
# Add your installation steps here
```

## Usage

Describe how to use your project here.

## Accessibility

This project prioritizes accessibility for all users.

## License

MIT License
"""
        
        return {
            "markdown": readme,
            "metadata": {
                "title": title,
                "tagline": "An accessible demo project",
                "tech_stack": tech_stack,
                "features": features
            }
        }
    
    def generate_submission_content(
        self,
        readme_metadata: Dict[str, Any],
        transcript: str
    ) -> Dict[str, Any]:
        """
        Generate hackathon submission fields.
        
        Args:
            readme_metadata: Metadata from README
            transcript: Video transcript
        
        Returns:
            Dictionary with submission fields
        """
        prompt = f"""Based on this project information, generate hackathon submission content:

**Title:** {readme_metadata.get('title', 'Untitled Project')}
**Tagline:** {readme_metadata.get('tagline', '')}
**Features:** {', '.join(readme_metadata.get('features', []))}
**Tech Stack:** {', '.join(readme_metadata.get('tech_stack', []))}

**Project Context:**
{transcript[:1000]}

Generate:
1. **Problem Statement** (2-3 sentences describing the problem this project solves)
2. **Solution** (2-3 sentences describing how the project solves it)
3. **Challenges** (2-3 bullet points about technical challenges faced)
4. **What's Next** (2-3 bullet points about future improvements)

Format as JSON with keys: problem_statement, solution, challenges, whats_next"""

        try:
            result = self.client.generate_text(prompt)
            
            # Try to extract JSON from the response
            import json
            start_idx = result.find('{')
            end_idx = result.rfind('}') + 1
            if start_idx != -1 and end_idx > start_idx:
                json_str = result[start_idx:end_idx]
                submission_data = json.loads(json_str)
                return submission_data
            else:
                # Fallback if JSON parsing fails
                return {
                    "problem_statement": "Enhancing accessibility in hackathon projects",
                    "solution": "Automated demo-to-documentation generator with accessibility features",
                    "challenges": "Integrating multiple AI services\nEnsuring WCAG compliance\nReal-time video processing",
                    "whats_next": "Add more language support\nImprove AI accuracy\nIntegrate with popular hackathon platforms"
                }
        except Exception as e:
            print(f"Error generating submission content: {e}")
            return {
                "problem_statement": "To be filled",
                "solution": "To be filled",
                "challenges": "To be filled",
                "whats_next": "To be filled"
            }
