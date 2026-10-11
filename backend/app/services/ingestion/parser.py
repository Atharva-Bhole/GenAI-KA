import os
from typing import Any, Dict, List
import docx
from pypdf import PdfReader

class DocumentParser:
    @staticmethod
    def parse_file(file_path: str, filename: str) -> List[Dict[str, Any]]:
        ext = os.path.splitext(filename)[1].lower()
        if ext == ".pdf":
            return DocumentParser._parse_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return DocumentParser._parse_docx(file_path)
        return DocumentParser._parse_text(file_path)

    @staticmethod
    def _parse_pdf(file_path: str) -> List[Dict[str, Any]]:
        pages = []
        try:
            reader = PdfReader(file_path)
            for idx, page in enumerate(reader.pages):
                txt = page.extract_text() or ""
                if txt.strip():
                    pages.append({
                        "page_number": idx + 1,
                        "section_title": f"Page {idx + 1}",
                        "text": txt.strip()
                    })
        except Exception:
            pass
        return pages

    @staticmethod
    def _parse_docx(file_path: str) -> List[Dict[str, Any]]:
        segments = []
        try:
            doc = docx.Document(file_path)
            current_section = "General"
            buffer = []
            page_counter = 1

            for para in doc.paragraphs:
                txt = para.text.strip()
                if not txt:
                    continue
                if para.style.name.startswith("Heading"):
                    if buffer:
                        segments.append({
                            "page_number": page_counter,
                            "section_title": current_section,
                            "text": "\n".join(buffer)
                        })
                        buffer = []
                    current_section = txt
                else:
                    buffer.append(txt)
                    if len(buffer) >= 6:
                        page_counter += 1

            if buffer:
                segments.append({
                    "page_number": page_counter,
                    "section_title": current_section,
                    "text": "\n".join(buffer)
                })
        except Exception:
            pass
        return segments

    @staticmethod
    def _parse_text(file_path: str) -> List[Dict[str, Any]]:
        segments = []
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            lines = content.splitlines()
            current_section = "Overview"
            buffer = []
            page_idx = 1

            for line in lines:
                s_line = line.strip()
                if s_line.startswith("# ") or s_line.startswith("## ") or s_line.startswith("Section "):
                    if buffer:
                        segments.append({
                            "page_number": page_idx,
                            "section_title": current_section,
                            "text": "\n".join(buffer)
                        })
                        buffer = []
                        page_idx += 1
                    current_section = s_line.replace("#", "").strip()
                else:
                    if s_line:
                        buffer.append(s_line)

            if buffer:
                segments.append({
                    "page_number": page_idx,
                    "section_title": current_section,
                    "text": "\n".join(buffer)
                })
        except Exception:
            pass
        return segments

parser = DocumentParser()
