import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class PDFService:
    @staticmethod
    def generate_interview_report(interview, user, answers, output_path):
        """
        Generates a professional PDF interview report using ReportLab.
        """
        # Ensure directories exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        doc = SimpleDocTemplate(
            output_path, 
            pagesize=letter,
            rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54
        )
        
        styles = getSampleStyleSheet()
        
        # Define modern colors (SaaS Theme)
        primary_color = colors.HexColor('#4f46e5')   # Indigo
        secondary_color = colors.HexColor('#0f172a') # Slate Dark
        accent_color = colors.HexColor('#10b981')    # Emerald Green
        text_color = colors.HexColor('#334155')      # Muted slate text
        bg_light = colors.HexColor('#f8fafc')        # Very light grey
        
        # Custom Typography Styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontSize=26,
            leading=32,
            textColor=primary_color,
            spaceAfter=6
        )
        
        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontSize=11,
            leading=16,
            textColor=text_color,
            spaceAfter=20
        )
        
        h2_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontSize=16,
            leading=20,
            textColor=secondary_color,
            spaceBefore=14,
            spaceAfter=8,
            keepWithNext=True
        )
        
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=text_color,
            spaceAfter=8
        )
        
        bold_body_style = ParagraphStyle(
            'BoldBody',
            parent=body_style,
            fontName='Helvetica-Bold'
        )
        
        score_text_style = ParagraphStyle(
            'ScoreText',
            parent=styles['Normal'],
            fontSize=24,
            leading=28,
            textColor=accent_color,
            alignment=1, # Center
            fontName='Helvetica-Bold'
        )
        
        bullet_style = ParagraphStyle(
            'Bullet',
            parent=body_style,
            leftIndent=15,
            firstLineIndent=-10,
            spaceAfter=4
        )

        story = []
        
        # 1. Header Section
        story.append(Paragraph("InterviewAce AI", title_style))
        story.append(Paragraph("Personalized Interview Feedback & Performance Analysis Report", subtitle_style))
        story.append(Spacer(1, 10))
        
        # 2. Metadata & Overall Score Grid
        meta_data = [
            [
                Paragraph("<b>Candidate Name:</b>", body_style), 
                Paragraph(user.name, body_style),
                Paragraph("<b>Overall Score:</b>", body_style),
                Paragraph(f"{interview.score}/100", bold_body_style)
            ],
            [
                Paragraph("<b>Email:</b>", body_style), 
                Paragraph(user.email, body_style),
                Paragraph("<b>Technical Score:</b>", body_style),
                Paragraph(f"{interview.technical_score}/100", body_style)
            ],
            [
                Paragraph("<b>Domain:</b>", body_style), 
                Paragraph(interview.category, body_style),
                Paragraph("<b>Communication:</b>", body_style),
                Paragraph(f"{interview.communication_score}/100", body_style)
            ],
            [
                Paragraph("<b>Difficulty:</b>", body_style), 
                Paragraph(interview.difficulty, body_style),
                Paragraph("<b>Confidence:</b>", body_style),
                Paragraph(f"{interview.confidence_score}/100", body_style)
            ],
            [
                Paragraph("<b>Date:</b>", body_style), 
                Paragraph(interview.date.strftime('%B %d, %Y %I:%M %p'), body_style),
                Paragraph("", body_style),
                Paragraph("", body_style)
            ]
        ]
        
        meta_table = Table(meta_data, colWidths=[110, 150, 120, 120])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg_light),
            ('PADDING', (0,0), (-1,-1), 8),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LINEBELOW', (0,-1), (-1,-1), 1, primary_color),
            ('BOTTOMPADDING', (0,-1), (-1,-1), 10),
        ]))
        
        story.append(meta_table)
        story.append(Spacer(1, 20))
        
        # 3. Performance Analysis
        story.append(Paragraph("Performance Assessment Summary", h2_style))
        
        avg_score = interview.score
        if avg_score >= 80:
            summary_text = "Excellent performance! You have demonstrated strong technical capability and structured communication. You are well-prepared for entry-level and intermediate interviews in this domain."
        elif avg_score >= 60:
            summary_text = "Good effort. You display solid foundational knowledge, but need to improve in technical depth or detail in your answers. Focusing on core concepts and structural layout of responses will bridge the gap."
        else:
            summary_text = "Needs preparation. You missed several key concepts in this category. We highly recommend generating a customized learning roadmap on InterviewAce AI and prioritizing core fundamentals before your next interview."
            
        story.append(Paragraph(summary_text, body_style))
        story.append(Spacer(1, 15))
        
        # 4. Answers Breakdown
        story.append(Paragraph("Detailed Question-by-Question Feedback", h2_style))
        
        for idx, ans in enumerate(answers):
            story.append(Paragraph(f"<b>Question {idx + 1}:</b> {ans.question_text}", bold_body_style))
            story.append(Spacer(1, 4))
            
            # Answer Box
            ans_box_data = [
                [Paragraph("<b>Your Answer:</b>", body_style), Paragraph(ans.answer, body_style)],
                [Paragraph("<b>AI Suggested Answer:</b>", body_style), Paragraph(ans.suggested_answer or "N/A", body_style)],
                [Paragraph("<b>Score:</b>", body_style), Paragraph(f"<b>{ans.score}/100</b>", bold_body_style)],
            ]
            
            ans_table = Table(ans_box_data, colWidths=[100, 400])
            ans_table.setStyle(TableStyle([
                ('PADDING', (0,0), (-1,-1), 6),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.lightgrey),
            ]))
            
            story.append(ans_table)
            story.append(Spacer(1, 8))
            
            # Strengths, Weaknesses, Tips
            story.append(Paragraph("<b>Strengths:</b>", body_style))
            for strength in str(ans.feedback_strengths).split('\n'):
                if strength.strip():
                    # Strip lead bullets
                    clean_str = strength.strip().lstrip('•').lstrip('*').strip()
                    story.append(Paragraph(f"• {clean_str}", bullet_style))
                    
            story.append(Spacer(1, 4))
            story.append(Paragraph("<b>Areas for Improvement:</b>", body_style))
            for weakness in str(ans.feedback_weaknesses).split('\n'):
                if weakness.strip():
                    clean_weak = weakness.strip().lstrip('•').lstrip('*').strip()
                    story.append(Paragraph(f"• {clean_weak}", bullet_style))
                    
            story.append(Spacer(1, 15))
            
        # Build document
        doc.build(story)
        return output_path
