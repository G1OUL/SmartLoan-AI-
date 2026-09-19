import re
from flask import Blueprint, request, jsonify

chat_bp = Blueprint('chat', __name__, url_prefix='/api/v1/chat')

ADVISORY_KNOWLEDGE_BASE = [
    {
        "keywords": ["flat", "reducing", "difference", "flat rate"],
        "reply": (
            "**Flat vs. Reducing Interest Rate:**\n\n"
            "• **Flat Rate:** Interest is calculated on the entire original principal throughout the loan tenure. This makes the effective interest rate almost **double** the advertised nominal rate!\n"
            "• **Reducing Balance Rate (Standard for Banks):** Interest is calculated each month only on the outstanding principal balance as you pay off EMIs.\n\n"
            "💡 *Smart Tip:* Always choose a reducing balance rate or check SmartLoan AI's **Effective APR** to see your true annualized cost."
        )
    },
    {
        "keywords": ["prepayment", "foreclosure", "part payment", "pre-pay", "tenure"],
        "reply": (
            "**Prepayment & Tenure Reduction Impact:**\n\n"
            "• Making just **one extra EMI payment per year** can reduce a 20-year home loan by **3 to 4 years** and save lakhs in interest!\n"
            "• Under RBI guidelines, commercial banks **cannot charge prepayment penalties** on floating rate home, vehicle, or personal loans taken by individual borrowers.\n\n"
            "💡 *Smart Tip:* When prepaying, always instruct the bank to keep your EMI constant and reduce the loan tenure to maximize your interest savings."
        )
    },
    {
        "keywords": ["cibil", "credit score", "score", "improve", "low cibil"],
        "reply": (
            "**Actionable Ways to Boost Your CIBIL Score (650 → 750+):**\n\n"
            "1. **Never miss EMI or credit card due dates** (Payment history accounts for 35% of your score).\n"
            "2. **Keep Credit Utilization Ratio (CUR) below 30%** on credit cards.\n"
            "3. **Avoid multiple simultaneous loan applications** (Each triggers a hard inquiry that drops your score by 5-10 points; SmartLoan AI uses soft estimates with 0 hard pull impact).\n"
            "4. **Maintain a healthy credit mix** of secured loans (Home/Auto) and unsecured credit.\n"
            "5. Review your credit bureau report to dispute any incorrect default records."
        )
    },
    {
        "keywords": ["foir", "dti", "debt", "obligation", "ratio"],
        "reply": (
            "**What is FOIR and DTI?**\n\n"
            "• **FOIR (Fixed Obligation to Income Ratio):** Percentage of your monthly income that goes toward existing EMIs + the proposed new EMI. Indian banks prefer a FOIR under **40% to 50%**.\n"
            "• **DTI (Debt to Income Ratio):** Ratio of total monthly debt service to gross monthly income.\n\n"
            "💡 *Smart Tip:* If your FOIR exceeds 50%, add a working co-applicant (spouse or parent) to pool income and ensure instant sanction!"
        )
    },
    {
        "keywords": ["hidden", "fee", "charges", "gst", "insurance", "processing fee"],
        "reply": (
            "**Hidden Ancillary Charges to Watch Out For:**\n\n"
            "1. **Processing Fee:** Usually 0.35% to 1.50% of the loan amount.\n"
            "2. **18% GST on Processing Fees:** Mandatory tax added to all bank fees.\n"
            "3. **Credit Shield / Loan Insurance:** Often bundled into sanction letters (~0.4% to 0.6% of loan). Note: IRDAI rules state this is optional, not mandatory!\n"
            "4. **Legal & Technical Verification Charges:** ₹1,500 to ₹5,000 for property loans.\n\n"
            "Use our **True Cost Calculator** tab to see your exact net disbursed amount and total borrowing cost."
        )
    },
    {
        "keywords": ["hindi", "namaste", "loan", "मदद", "ब्याज", "ऋण"],
        "reply": (
            "**नमस्ते! स्मार्टलोन एआई (SmartLoan AI) वित्तीय सलाहकार में आपका स्वागत है।**\n\n"
            "आप हमसे ऋण अनुमोदन (Approval Probability), बैंक ब्याज दरें, छिपे हुए शुल्क (Hidden Fees), "
            "सिबिल स्कोर सुधारने के उपाय, और आवश्यक दस्तावेज़ों के बारे में कोई भी प्रश्न पूछ सकते हैं।"
        )
    }
]

@chat_bp.route('/advisor', methods=['POST'])
def chat_advisor():
    data = request.get_json() or {}
    user_message = data.get('message', '').strip().lower()
    
    if not user_message:
        return jsonify({'reply': "Hello! I am your SmartLoan AI Financial Coach. Ask me anything about loan eligibility, interest rates, CIBIL scores, or hidden fees!"}), 200
        
    for item in ADVISORY_KNOWLEDGE_BASE:
        for kw in item['keywords']:
            if re.search(r'\b' + re.escape(kw) + r'\b', user_message, re.IGNORECASE):
                return jsonify({'reply': item['reply']}), 200
                
    # Fallback general response
    default_reply = (
        f"Thank you for asking about '{data.get('message', '')}'. "
        "Here are key recommendations from our SmartLoan AI Financial Advisory team:\n\n"
        "• **Compare Effective APR:** Don't judge a loan by headline interest rates alone; always factor in upfront processing fees and 18% GST.\n"
        "• **Safe Borrowing Limit:** Keep your total monthly EMIs within 40% of your disposable income.\n"
        "• **Zero Telemarketing Guarantee:** SmartLoan AI will never share your contact details with sales agents.\n\n"
        "You can run an instant approval prediction in our **Loan Wizard** or check the **True Cost Calculator** for amortized interest charts."
    )
    return jsonify({'reply': default_reply}), 200
