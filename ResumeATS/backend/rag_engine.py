"""
RAG Engine for Resume ATS Analysis
Implements vector-based retrieval for grounded, context-aware resume analysis
Uses FAISS for efficient vector storage and retrieval
"""

import os
from typing import List, Dict, Any, Optional
from openai import OpenAI
import numpy as np
from dataclasses import dataclass, asdict
import json
import faiss
import pickle
from datetime import datetime

@dataclass
class Chunk:
    """Represents a text chunk with metadata"""
    text: str
    source: str  # 'resume', 'job_description', 'ats_rules'
    section: str  # 'summary', 'experience', 'skills', etc.
    embedding: List[float] = None

class RAGEngine:
    """
    Retrieval-Augmented Generation Engine for ATS Analysis
    Uses OpenAI embeddings + FAISS for semantic search with persistence
    """
    
    def __init__(self, api_key: str, index_dir: str = "faiss_indexes"):
        self.client = OpenAI(api_key=api_key)
        self.chunks: List[Chunk] = []
        self.index_dir = index_dir
        self.embedding_dim = 1536  # OpenAI text-embedding-3-small dimension
        
        # Create index directory
        os.makedirs(self.index_dir, exist_ok=True)
        
        # Initialize FAISS index
        self.faiss_index: Optional[faiss.Index] = None
        self.index_to_chunk_map: Dict[int, int] = {}  # FAISS index -> chunk index
        
        # ATS scoring rubrics and rules
        self.ats_rules = self._load_ats_rules()
        
        # Load existing index if available
        self._load_index()
        
    def _load_ats_rules(self) -> List[Dict[str, Any]]:
        """Load ATS scoring rules and best practices"""
        return [
            {
                "category": "Keyword Optimization",
                "rules": [
                    "Resume should contain 70%+ of job description keywords",
                    "Keywords should appear in context, not just listed",
                    "Use exact keyword matches from job description",
                    "Include industry-specific terminology"
                ],
                "weight": 30
            },
            {
                "category": "Formatting",
                "rules": [
                    "Use standard section headers (Experience, Education, Skills)",
                    "Avoid tables, text boxes, headers/footers",
                    "Use simple bullet points",
                    "Consistent date formatting",
                    "No images or graphics"
                ],
                "weight": 20
            },
            {
                "category": "Content Quality",
                "rules": [
                    "Quantify achievements with metrics",
                    "Use action verbs to start bullet points",
                    "Show impact and results",
                    "Relevant experience highlighted",
                    "No spelling or grammar errors"
                ],
                "weight": 25
            },
            {
                "category": "Experience Relevance",
                "rules": [
                    "Recent experience matches job requirements",
                    "Progressive career growth shown",
                    "Relevant projects and achievements",
                    "Industry experience alignment"
                ],
                "weight": 15
            },
            {
                "category": "Skills Match",
                "rules": [
                    "Technical skills match job requirements",
                    "Certifications relevant to role",
                    "Tools and technologies listed",
                    "Soft skills demonstrated through achievements"
                ],
                "weight": 10
            }
        ]
    
    def chunk_text(self, text: str, source: str, section: str = "general", chunk_size: int = 500) -> List[Chunk]:
        """
        Split text into semantic chunks
        """
        chunks = []
        
        # Split by paragraphs or sections
        paragraphs = text.split('\n\n')
        
        current_chunk = ""
        for para in paragraphs:
            if len(current_chunk) + len(para) < chunk_size:
                current_chunk += para + "\n\n"
            else:
                if current_chunk.strip():
                    chunks.append(Chunk(
                        text=current_chunk.strip(),
                        source=source,
                        section=section
                    ))
                current_chunk = para + "\n\n"
        
        # Add remaining chunk
        if current_chunk.strip():
            chunks.append(Chunk(
                text=current_chunk.strip(),
                source=source,
                section=section
            ))
        
        return chunks
    
    def get_embedding(self, text: str) -> List[float]:
        """Get embedding vector for text using OpenAI"""
        response = self.client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    
    def embed_chunks(self, chunks: List[Chunk]) -> List[Chunk]:
        """Generate embeddings for all chunks"""
        for chunk in chunks:
            chunk.embedding = self.get_embedding(chunk.text)
        return chunks
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        vec1 = np.array(vec1)
        vec2 = np.array(vec2)
        return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    
    def retrieve_relevant_chunks(self, query: str, top_k: int = 5, source_filter: str = None) -> List[Chunk]:
        """
        Retrieve most relevant chunks for a query
        """
        query_embedding = self.get_embedding(query)
        
        # Filter chunks by source if specified
        filtered_chunks = self.chunks
        if source_filter:
            filtered_chunks = [c for c in self.chunks if c.source == source_filter]
        
        # Calculate similarities
        similarities = []
        for chunk in filtered_chunks:
            if chunk.embedding:
                sim = self.cosine_similarity(query_embedding, chunk.embedding)
                similarities.append((chunk, sim))
        
        # Sort by similarity and return top_k
        similarities.sort(key=lambda x: x[1], reverse=True)
        return [chunk for chunk, _ in similarities[:top_k]]
    
    def index_resume(self, resume_text: str):
        """Index resume by chunking and embedding"""
        # Detect sections
        sections = self._detect_sections(resume_text)
        
        for section_name, section_text in sections.items():
            chunks = self.chunk_text(section_text, source="resume", section=section_name)
            chunks = self.embed_chunks(chunks)
            self.chunks.extend(chunks)
    
    def index_job_description(self, jd_text: str):
        """Index job description by chunking and embedding"""
        chunks = self.chunk_text(jd_text, source="job_description", section="requirements")
        chunks = self.embed_chunks(chunks)
        self.chunks.extend(chunks)
    
    def index_ats_rules(self):
        """Index ATS rules for retrieval"""
        for rule_category in self.ats_rules:
            rule_text = f"{rule_category['category']}: " + " ".join(rule_category['rules'])
            chunks = self.chunk_text(rule_text, source="ats_rules", section=rule_category['category'])
            chunks = self.embed_chunks(chunks)
            self.chunks.extend(chunks)
    
    def _detect_sections(self, text: str) -> Dict[str, str]:
        """Detect common resume sections"""
        sections = {}
        current_section = "summary"
        current_text = []
        
        lines = text.split('\n')
        
        section_keywords = {
            'summary': ['summary', 'objective', 'profile', 'about'],
            'experience': ['experience', 'work history', 'employment', 'professional experience'],
            'education': ['education', 'academic', 'degree'],
            'skills': ['skills', 'technical skills', 'competencies', 'expertise'],
            'projects': ['projects', 'portfolio'],
            'certifications': ['certifications', 'certificates', 'licenses']
        }
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Check if line is a section header
            section_found = False
            for section_name, keywords in section_keywords.items():
                if any(keyword in line_lower for keyword in keywords) and len(line.split()) < 5:
                    # Save previous section
                    if current_text:
                        sections[current_section] = '\n'.join(current_text)
                    
                    # Start new section
                    current_section = section_name
                    current_text = []
                    section_found = True
                    break
            
            if not section_found and line.strip():
                current_text.append(line)
        
        # Save last section
        if current_text:
            sections[current_section] = '\n'.join(current_text)
        
        return sections
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text"""
        # Use OpenAI to extract keywords
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Extract important keywords, skills, and technologies from the text. Return as comma-separated list."},
                {"role": "user", "content": text}
            ],
            temperature=0.3
        )
        
        keywords_text = response.choices[0].message.content
        keywords = [k.strip() for k in keywords_text.split(',')]
        return keywords
    
    def analyze_with_rag(self, resume_text: str, job_description: str = None) -> Dict[str, Any]:
        """
        Perform RAG-based ATS analysis
        """
        # Clear previous chunks
        self.chunks = []
        
        # Index documents
        self.index_resume(resume_text)
        if job_description:
            self.index_job_description(job_description)
        self.index_ats_rules()
        
        # Retrieve relevant context
        resume_chunks = self.retrieve_relevant_chunks("resume content", top_k=10, source_filter="resume")
        
        if job_description:
            jd_chunks = self.retrieve_relevant_chunks("job requirements", top_k=5, source_filter="job_description")
        else:
            jd_chunks = []
        
        ats_rule_chunks = self.retrieve_relevant_chunks("ATS scoring rules", top_k=5, source_filter="ats_rules")
        
        # Build context for LLM
        context = self._build_context(resume_chunks, jd_chunks, ats_rule_chunks)
        
        # Generate analysis using retrieved context
        analysis = self._generate_analysis(context, job_description is not None)
        
        return analysis
    
    def _build_context(self, resume_chunks: List[Chunk], jd_chunks: List[Chunk], ats_chunks: List[Chunk]) -> str:
        """Build context string from retrieved chunks"""
        context = "<retrieved_context>\n\n"
        
        context += "=== RESUME CONTENT ===\n"
        for chunk in resume_chunks:
            context += f"[Section: {chunk.section}]\n{chunk.text}\n\n"
        
        if jd_chunks:
            context += "\n=== JOB DESCRIPTION ===\n"
            for chunk in jd_chunks:
                context += f"{chunk.text}\n\n"
        
        context += "\n=== ATS SCORING RULES ===\n"
        for chunk in ats_chunks:
            context += f"{chunk.text}\n\n"
        
        context += "</retrieved_context>"
        
        return context
    
    def _generate_analysis(self, context: str, has_jd: bool) -> Dict[str, Any]:
        """Generate analysis using LLM with retrieved context"""
        
        if has_jd:
            prompt = f"""You are an AI Resume ATS Engine with RAG. Analyze the resume against the job description using ONLY the retrieved context below.

{context}

STRICT RULES:
- Only use information from the retrieved context
- Never hallucinate or assume information
- If something is not in the context, state "Not found in retrieved context"

Provide analysis in JSON format with these keys:
{{
  "ats_score": 75,
  "score_reasoning": ["Reason 1", "Reason 2", "Reason 3"],
  "matched_keywords": ["keyword1", "keyword2"],
  "missing_keywords": ["missing1", "missing2"],
  "skill_gaps": ["gap1", "gap2"],
  "section_analysis": {{
    "summary": "Analysis of summary section",
    "skills": "Analysis of skills section",
    "experience": "Analysis of experience section"
  }},
  "improvement_suggestions": [
    "Specific suggestion 1",
    "Specific suggestion 2"
  ],
  "ats_score_breakdown": {{
    "keyword_optimization": 80,
    "formatting": 70,
    "content_quality": 75,
    "experience_relevance": 80,
    "skills_match": 70
  }}
}}

Return ONLY valid JSON."""
        else:
            prompt = f"""You are an AI Resume ATS Engine with RAG. Analyze the resume using ONLY the retrieved context below.

{context}

STRICT RULES:
- Only use information from the retrieved context
- Never hallucinate or assume information
- If something is not in the context, state "Not found in retrieved context"

Provide analysis in JSON format with these keys:
{{
  "ats_score": 75,
  "score_reasoning": ["Reason 1", "Reason 2", "Reason 3"],
  "top_skills": ["skill1", "skill2"],
  "candidate_level": "Mid-Level/Senior/Entry-Level",
  "section_analysis": {{
    "summary": "Analysis of summary section",
    "skills": "Analysis of skills section",
    "experience": "Analysis of experience section"
  }},
  "pros": ["Strength 1", "Strength 2"],
  "cons": ["Weakness 1", "Weakness 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "ats_score_breakdown": {{
    "keyword_optimization": 80,
    "formatting": 70,
    "content_quality": 75,
    "achievements": 65,
    "overall_presentation": 85
  }}
}}

Return ONLY valid JSON."""
        
        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert ATS analyzer. Use ONLY the retrieved context. Never hallucinate."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        analysis = json.loads(response.choices[0].message.content)
        return analysis
    
    def clear_index(self):
        """Clear all indexed chunks"""
        self.chunks = []
        self.faiss_index = None
        self.index_to_chunk_map = {}
    
    def _get_index_path(self, index_name: str = "default") -> tuple:
        """Get paths for FAISS index and metadata"""
        faiss_path = os.path.join(self.index_dir, f"{index_name}.faiss")
        metadata_path = os.path.join(self.index_dir, f"{index_name}_metadata.pkl")
        return faiss_path, metadata_path
    
    def _load_index(self, index_name: str = "default") -> bool:
        """Load FAISS index and metadata from disk"""
        faiss_path, metadata_path = self._get_index_path(index_name)
        
        if os.path.exists(faiss_path) and os.path.exists(metadata_path):
            try:
                # Load FAISS index
                self.faiss_index = faiss.read_index(faiss_path)
                
                # Load metadata
                with open(metadata_path, 'rb') as f:
                    metadata = pickle.load(f)
                    self.chunks = metadata['chunks']
                    self.index_to_chunk_map = metadata['index_to_chunk_map']
                
                print(f"✅ Loaded FAISS index: {len(self.chunks)} chunks")
                return True
            except Exception as e:
                print(f"⚠️ Error loading index: {e}")
                return False
        return False
    
    def _save_index(self, index_name: str = "default"):
        """Save FAISS index and metadata to disk"""
        if self.faiss_index is None or len(self.chunks) == 0:
            print("⚠️ No index to save")
            return
        
        faiss_path, metadata_path = self._get_index_path(index_name)
        
        try:
            # Save FAISS index
            faiss.write_index(self.faiss_index, faiss_path)
            
            # Save metadata
            metadata = {
                'chunks': self.chunks,
                'index_to_chunk_map': self.index_to_chunk_map,
                'created_at': datetime.now().isoformat(),
                'num_chunks': len(self.chunks)
            }
            
            with open(metadata_path, 'wb') as f:
                pickle.dump(metadata, f)
            
            print(f"✅ Saved FAISS index: {faiss_path}")
            print(f"✅ Saved metadata: {metadata_path}")
            print(f"📊 Total chunks: {len(self.chunks)}")
        except Exception as e:
            print(f"❌ Error saving index: {e}")
    
    def _initialize_faiss_index(self):
        """Initialize a new FAISS index"""
        # Use IndexFlatL2 for exact search (can be upgraded to IndexIVFFlat for speed)
        self.faiss_index = faiss.IndexFlatL2(self.embedding_dim)
        print(f"🔧 Initialized new FAISS index (dim={self.embedding_dim})")
    
    def _add_to_faiss_index(self, embeddings: np.ndarray, chunk_indices: List[int]):
        """Add embeddings to FAISS index"""
        if self.faiss_index is None:
            self._initialize_faiss_index()
        
        # Add to FAISS
        start_idx = self.faiss_index.ntotal
        self.faiss_index.add(embeddings)
        
        # Update mapping
        for i, chunk_idx in enumerate(chunk_indices):
            self.index_to_chunk_map[start_idx + i] = chunk_idx
    
    def retrieve_relevant_chunks_faiss(self, query: str, top_k: int = 5, source_filter: str = None) -> List[Chunk]:
        """
        Retrieve most relevant chunks using FAISS
        Much faster than cosine similarity for large datasets
        """
        if self.faiss_index is None or self.faiss_index.ntotal == 0:
            print("⚠️ FAISS index is empty, falling back to standard retrieval")
            return self.retrieve_relevant_chunks(query, top_k, source_filter)
        
        # Get query embedding
        query_embedding = self.get_embedding(query)
        query_vector = np.array([query_embedding], dtype=np.float32)
        
        # Search in FAISS
        distances, indices = self.faiss_index.search(query_vector, min(top_k * 2, self.faiss_index.ntotal))
        
        # Map back to chunks and apply filter
        relevant_chunks = []
        for idx in indices[0]:
            if idx == -1:  # FAISS returns -1 for empty slots
                continue
            
            chunk_idx = self.index_to_chunk_map.get(int(idx))
            if chunk_idx is not None and chunk_idx < len(self.chunks):
                chunk = self.chunks[chunk_idx]
                
                # Apply source filter
                if source_filter is None or chunk.source == source_filter:
                    relevant_chunks.append(chunk)
                
                if len(relevant_chunks) >= top_k:
                    break
        
        return relevant_chunks
    
    def index_resume_with_faiss(self, resume_text: str, save: bool = True, index_name: str = "default"):
        """Index resume using FAISS for persistent storage"""
        # Clear previous index
        self.clear_index()
        
        # Detect sections
        sections = self._detect_sections(resume_text)
        
        all_embeddings = []
        chunk_indices = []
        
        for section_name, section_text in sections.items():
            chunks = self.chunk_text(section_text, source="resume", section=section_name)
            
            for chunk in chunks:
                # Generate embedding
                chunk.embedding = self.get_embedding(chunk.text)
                self.chunks.append(chunk)
                
                # Collect for batch FAISS insertion
                all_embeddings.append(chunk.embedding)
                chunk_indices.append(len(self.chunks) - 1)
        
        # Add to FAISS index
        if all_embeddings:
            embeddings_array = np.array(all_embeddings, dtype=np.float32)
            self._add_to_faiss_index(embeddings_array, chunk_indices)
        
        # Save to disk
        if save:
            self._save_index(index_name)
        
        print(f"✅ Indexed resume: {len(self.chunks)} chunks")
    
    def index_job_description_with_faiss(self, jd_text: str, save: bool = True, index_name: str = "default"):
        """Index job description using FAISS"""
        chunks = self.chunk_text(jd_text, source="job_description", section="requirements")
        
        all_embeddings = []
        chunk_indices = []
        
        for chunk in chunks:
            chunk.embedding = self.get_embedding(chunk.text)
            self.chunks.append(chunk)
            
            all_embeddings.append(chunk.embedding)
            chunk_indices.append(len(self.chunks) - 1)
        
        # Add to FAISS index
        if all_embeddings:
            embeddings_array = np.array(all_embeddings, dtype=np.float32)
            self._add_to_faiss_index(embeddings_array, chunk_indices)
        
        # Save to disk
        if save:
            self._save_index(index_name)
        
        print(f"✅ Indexed JD: {len(chunks)} chunks")
    
    def analyze_with_rag_faiss(self, resume_text: str, job_description: str = None, index_name: str = None) -> Dict[str, Any]:
        """
        Perform RAG-based ATS analysis using FAISS
        """
        # Generate unique index name if not provided
        if index_name is None:
            index_name = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Clear and index documents
        self.clear_index()
        
        # Index resume
        self.index_resume_with_faiss(resume_text, save=True, index_name=index_name)
        
        # Index job description if provided
        if job_description:
            self.index_job_description_with_faiss(job_description, save=True, index_name=index_name)
        
        # Index ATS rules
        self.index_ats_rules()
        
        # Retrieve relevant context using FAISS
        resume_chunks = self.retrieve_relevant_chunks_faiss("resume content", top_k=10, source_filter="resume")
        
        if job_description:
            jd_chunks = self.retrieve_relevant_chunks_faiss("job requirements", top_k=5, source_filter="job_description")
        else:
            jd_chunks = []
        
        ats_rule_chunks = self.retrieve_relevant_chunks_faiss("ATS scoring rules", top_k=5, source_filter="ats_rules")
        
        # Build context for LLM
        context = self._build_context(resume_chunks, jd_chunks, ats_rule_chunks)
        
        # Generate analysis using retrieved context
        analysis = self._generate_analysis(context, job_description is not None)
        
        # Add metadata
        analysis['faiss_index_name'] = index_name
        analysis['total_chunks_indexed'] = len(self.chunks)
        
        return analysis
    
    def list_saved_indexes(self) -> List[Dict[str, Any]]:
        """List all saved FAISS indexes"""
        indexes = []
        
        if not os.path.exists(self.index_dir):
            return indexes
        
        for filename in os.listdir(self.index_dir):
            if filename.endswith('_metadata.pkl'):
                metadata_path = os.path.join(self.index_dir, filename)
                try:
                    with open(metadata_path, 'rb') as f:
                        metadata = pickle.load(f)
                        indexes.append({
                            'name': filename.replace('_metadata.pkl', ''),
                            'num_chunks': metadata.get('num_chunks', 0),
                            'created_at': metadata.get('created_at', 'Unknown'),
                            'path': metadata_path
                        })
                except Exception as e:
                    print(f"Error reading {filename}: {e}")
        
        return indexes
    
    def delete_index(self, index_name: str) -> bool:
        """Delete a saved FAISS index"""
        faiss_path, metadata_path = self._get_index_path(index_name)
        
        try:
            if os.path.exists(faiss_path):
                os.remove(faiss_path)
            if os.path.exists(metadata_path):
                os.remove(metadata_path)
            print(f"✅ Deleted index: {index_name}")
            return True
        except Exception as e:
            print(f"❌ Error deleting index: {e}")
            return False
