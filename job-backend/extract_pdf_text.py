# extract_pdf_text.py
import asyncpg
import PyPDF2
import os

async def extract_pdf_text(cv_id, file_path):
    """Extract text from PDF"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ''
            for page in pdf_reader.pages:
                text += page.extract_text()
        
        # Update cv_data with extracted text
        conn = await asyncpg.connect('postgresql://...')
        await conn.execute("""
            UPDATE user_cvs
            SET cv_data = jsonb_build_object('extracted_text', $1)
            WHERE id = $2
        """, text, cv_id)
        await conn.close()
        
        return text
    except Exception as e:
        print(f"Error extracting CV {cv_id}: {e}")
        return None

async def process_all_cvs():
    conn = await asyncpg.connect('postgresql://...')
    cvs = await conn.fetch("""
        SELECT id, file_path 
        FROM user_cvs 
        WHERE cv_data IS NULL OR cv_data->>'extracted_text' IS NULL
    """)
    
    for cv in cvs:
        full_path = f"/path/to/uploads/{cv['file_path']}"
        if os.path.exists(full_path):
            await extract_pdf_text(cv['id'], full_path)
            print(f"✅ Extracted CV {cv['id']}")
    
    await conn.close()