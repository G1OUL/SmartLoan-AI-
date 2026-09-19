import io
import json
from datetime import datetime
from flask import Blueprint, send_file, jsonify
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.models import LoanApplication
from app.ml.predictor import predict_loan_approval

pdf_bp = Blueprint('pdf_report', __name__, url_prefix='/api/v1/applications')

@pdf_bp.route('/<int:app_id>/report', methods=['GET'])
def generate_pdf_report(app_id):
    app = LoanApplication.query.get(app_id)
    if not app:
        return jsonify({'error': 'Application not found'}), 404
        
    # Get dynamic comparison
    data = {
        'age': app.age,
        'marital_status': app.marital_status,
        'dependents': app.dependents,
        'education': app.education,
        'employment_type': app.employment_type,
        'monthly_income': app.monthly_income,
        'coapplicant_income': app.coapplicant_income,
        'existing_emi': app.existing_emi,
        'credit_score': app.credit_score,
        'past_defaults': app.past_defaults,
        'loan_category': app.loan_category,
        'loan_amount': app.loan_amount,
        'loan_tenure_months': app.loan_tenure_months
    }
    pred_result = predict_loan_approval(data)
    bank_comparisons = pred_result.get('bank_comparisons', [])
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        alignment=0
    )
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#64748b'),
        alignment=0
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#334155')
    )
    table_hdr_style = ParagraphStyle(
        'TableHdr',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#1e293b')
    )

    story = []

    # Header section
    story.append(Paragraph("SmartLoan AI &bull; Loan Advisory & Sanction Summary", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"Ref ID: SLA-{app.id:06d} &bull; Generated on: {datetime.utcnow().strftime('%d %B %Y, %H:%M UTC')} &bull; In-Principle Approval Report", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#3b82f6'), spaceAfter=12))

    # Applicant Overview Table
    story.append(Paragraph("1. Applicant Financial Profile", section_heading))
    applicant_data = [
        [
            Paragraph("<b>Applicant Name:</b>", body_style), Paragraph(str(app.applicant_name), body_style),
            Paragraph("<b>CIBIL Bureau Score:</b>", body_style), Paragraph(f"{app.credit_score} / 900", body_style)
        ],
        [
            Paragraph("<b>Employment Type:</b>", body_style), Paragraph(str(app.employment_type), body_style),
            Paragraph("<b>Monthly Net Income:</b>", body_style), Paragraph(f"₹{int(app.monthly_income):,}", body_style)
        ],
        [
            Paragraph("<b>Loan Category:</b>", body_style), Paragraph(str(app.loan_category), body_style),
            Paragraph("<b>Requested Principal:</b>", body_style), Paragraph(f"₹{int(app.loan_amount):,}", body_style)
        ],
        [
            Paragraph("<b>Desired Tenure:</b>", body_style), Paragraph(f"{app.loan_tenure_months} Months ({round(app.loan_tenure_months/12, 1)} Yrs)", body_style),
            Paragraph("<b>FOIR Obligation Ratio:</b>", body_style), Paragraph(f"{round((app.foir_ratio or 0)*100, 1)}%", body_style)
        ]
    ]
    t1 = Table(applicant_data, colWidths=[120, 150, 130, 140])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t1)
    story.append(Spacer(1, 14))

    # AI Approval Verdict Box
    story.append(Paragraph("2. AI Underwriting Assessment & Probability", section_heading))
    band_color = '#10b981' if app.approval_probability >= 75 else ('#f59e0b' if app.approval_probability >= 50 else '#ef4444')
    verdict_data = [
        [
            Paragraph(f"<b>Overall Approval Confidence Score:</b> <font color='{band_color}' size='+3'><b>{app.approval_probability}%</b></font> ({app.approval_band} Confidence Band)", body_style)
        ],
        [
            Paragraph(f"<b>Recommended Primary Lender:</b> <b>{app.recommended_bank or 'State Bank of India'}</b> &bull; Zero Hard Pulls Performed", body_style)
        ]
    ]
    t_verdict = Table(verdict_data, colWidths=[540])
    t_verdict.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4' if app.approval_probability >= 70 else '#fefce8')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor(band_color)),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_verdict)
    story.append(Spacer(1, 14))

    # Multi-Bank Comparison Table
    story.append(Paragraph("3. Transparent Multi-Bank Rate & True Cost Comparison", section_heading))
    bank_rows = [
        [
            Paragraph("Bank / Lender", table_hdr_style),
            Paragraph("Odds", table_hdr_style),
            Paragraph("Headline Rate", table_hdr_style),
            Paragraph("Effective APR", table_hdr_style),
            Paragraph("Monthly EMI", table_hdr_style),
            Paragraph("Hidden Fees", table_hdr_style),
            Paragraph("Total Repayment", table_hdr_style)
        ]
    ]
    for b in bank_comparisons[:6]:
        bank_rows.append([
            Paragraph(b['bank_name'], table_cell_style),
            Paragraph(f"{b['approval_probability']}%", table_cell_style),
            Paragraph(f"{b['headline_rate']}%", table_cell_style),
            Paragraph(f"<b>{b['effective_apr']}%</b>", table_cell_style),
            Paragraph(f"₹{int(b['monthly_emi']):,}", table_cell_style),
            Paragraph(f"₹{int(b['total_upfront_fees']):,}", table_cell_style),
            Paragraph(f"₹{int(b['total_cost_of_borrowing']):,}", table_cell_style)
        ])
    t_banks = Table(bank_rows, colWidths=[120, 45, 65, 65, 75, 75, 95])
    t_banks.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_banks)
    story.append(Spacer(1, 14))

    # Hidden Cost Demystification Box
    story.append(Paragraph("4. True Cost of Borrowing & Fee Breakdown (RBI Transparency Guidelines)", section_heading))
    fee_notes = (
        "&bull; <b>Processing Fee:</b> Commercial banks charge 0.35% to 1.50% upfront.<br/>"
        "&bull; <b>Mandatory GST:</b> 18% Goods & Services Tax is automatically levied on all processing fees.<br/>"
        "&bull; <b>Loan Insurance:</b> Credit shield insurance (~0.4-0.6%) is often deducted from the disbursed amount.<br/>"
        "&bull; <b>Effective APR:</b> Represents the true annual percentage cost of your credit after factoring in upfront charges."
    )
    t_fee = Table([[Paragraph(fee_notes, body_style)]], colWidths=[540])
    t_fee.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#94a3b8')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_fee)
    story.append(Spacer(1, 14))

    # KYC Checklist Summary
    story.append(Paragraph("5. KYC Verification Checklist for Rapid Sanction", section_heading))
    kyc_text = (
        "1. PAN Card & Masked Aadhaar Card (Identity & Bureau verification)<br/>"
        "2. Latest 3 Months Salary Slips or 2 Years CA-certified ITR returns<br/>"
        "3. Last 6 Months Primary Bank Statement showing active cash flows<br/>"
        "4. Property title deeds / Admission letter / Dealership quotation (depending on category)"
    )
    t_kyc = Table([[Paragraph(kyc_text, body_style)]], colWidths=[540])
    t_kyc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#94a3b8')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(t_kyc)
    story.append(Spacer(1, 16))

    # Legal Disclaimer Footer
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cbd5e1'), spaceAfter=8))
    footer_text = (
        "<b>SmartLoan AI Consumer Protection Notice:</b> This report is an in-principle advisory generated using "
        "supervised machine learning algorithms and bank underwriting heuristics. Final loan sanction is subject to "
        "in-person verification and formal documentation by the respective financial institutions. SmartLoan AI does not "
        "sell or monetize applicant personal information to telemarketers."
    )
    story.append(Paragraph(footer_text, subtitle_style))

    doc.build(story)
    buffer.seek(0)
    
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"SmartLoan_Advisory_Report_{app.id:06d}.pdf",
        mimetype='application/pdf'
    )
