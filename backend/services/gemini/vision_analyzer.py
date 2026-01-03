"""Video and image analysis using Gemini Vision (synchronous)."""
from typing import List, Dict, Any, Tuple
import cv2
import numpy as np
from PIL import Image
import io
from .client import GeminiClient


class VisionAnalyzer:
    """Analyze video content using Gemini Vision API."""
    
    def __init__(self):
        """Initialize vision analyzer."""
        self.client = GeminiClient()
    
    def extract_key_frames(self, video_path: str, num_frames: int = 5) -> List[Tuple[float, bytes]]:
        """
        Extract key frames from video.
        
        Args:
            video_path: Path to video file
            num_frames: Number of frames to extract
        
        Returns:
            List of (timestamp, frame_bytes) tuples
        """
        cap = cv2.VideoCapture(video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        
        # Calculate frame indices to extract
        frame_indices = np.linspace(0, total_frames - 1, num_frames, dtype=int)
        
        frames = []
        for idx in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            
            if ret:
                # Convert frame to JPEG bytes
                timestamp = idx / fps
                _, buffer = cv2.imencode('.jpg', frame)
                frame_bytes = buffer.tobytes()
                frames.append((timestamp, frame_bytes))
        
        cap.release()
        return frames
    
    def analyze_frame(self, frame_data: bytes, timestamp: float) -> Dict[str, Any]:
        """
        Analyze a single frame for content.
        
        Args:
            frame_data: Frame image bytes
            timestamp: Timestamp in video
        
        Returns:
            Analysis result dictionary
        """
        prompt = """Analyze this screenshot from a project demo video.
        
Describe:
1. What UI elements or code are visible
2. What action or feature is being demonstrated
3. Any text visible on screen (code, titles, labels)
4. Technical details you can identify

Be concise and technical."""
        
        try:
            analysis = self.client.analyze_video_frame(frame_data, prompt)
            return {
                "timestamp": timestamp,
                "description": analysis,
                "frame_data": frame_data
            }
        except Exception as e:
            print(f"Error analyzing frame at {timestamp}s: {e}")
            return {
                "timestamp": timestamp,
                "description": "Analysis unavailable",
                "frame_data": frame_data
            }
    
    def analyze_video(self, video_path: str, num_frames: int = 5) -> List[Dict[str, Any]]:
        """
        Analyze entire video by extracting and analyzing key frames.
        
        Args:
            video_path: Path to video file
            num_frames: Number of frames to analyze
        
        Returns:
            List of frame analysis results
        """
        # Extract key frames
        frames = self.extract_key_frames(video_path, num_frames)
        
        # Analyze each frame
        analyses = []
        for timestamp, frame_data in frames:
            analysis = self.analyze_frame(frame_data, timestamp)
            analyses.append(analysis)
        
        return analyses
    
    def identify_tech_stack(self, frame_analyses: List[Dict[str, Any]]) -> List[str]:
        """
        Identify technologies from frame analyses.
        
        Args:
            frame_analyses: List of frame analysis results
        
        Returns:
            List of identified technologies
        """
        combined_context = "\n\n".join([
            f"Frame at {a['timestamp']}s: {a['description']}"
            for a in frame_analyses
        ])
        
        prompt = f"""Based on these video frame descriptions, identify the technologies and frameworks used:

{combined_context}

List only the specific technologies, frameworks, and tools mentioned or visible (e.g., React, Python, MongoDB, FastAPI).
Format as a comma-separated list."""
        
        try:
            result = self.client.generate_text(prompt)
            # Parse comma-separated list
            tech_stack = [tech.strip() for tech in result.split(',') if tech.strip()]
            return tech_stack
        except Exception as e:
            print(f"Error identifying tech stack: {e}")
            return []
    
    def extract_features(self, frame_analyses: List[Dict[str, Any]]) -> List[str]:
        """
        Extract key features from frame analyses.
        
        Args:
            frame_analyses: List of frame analysis results
        
        Returns:
            List of identified features
        """
        combined_context = "\n\n".join([
            f"Frame at {a['timestamp']}s: {a['description']}"
            for a in frame_analyses
        ])
        
        prompt = f"""Based on these video frame descriptions, list the key features demonstrated:

{combined_context}

List 3-7 main features of the project. Be specific and concise.
Format as a numbered list."""
        
        try:
            result = self.client.generate_text(prompt)
            # Parse numbered list
            lines = result.strip().split('\n')
            features = []
            for line in lines:
                # Remove numbering and clean up
                cleaned = line.strip()
                if cleaned and (cleaned[0].isdigit() or cleaned.startswith('-') or cleaned.startswith('•')):
                    # Remove leading number/bullet
                    feature = cleaned.lstrip('0123456789.-•) ').strip()
                    if feature:
                        features.append(feature)
            return features
        except Exception as e:
            print(f"Error extracting features: {e}")
            return []
