from flask import Blueprint, request, jsonify

calculator_bp = Blueprint('calculator', __name__, url_prefix='/api/v1/calculator')

@calculator_bp.route('/cost-breakdown', methods=['POST'])
def calculate_cost_breakdown():
    data = request.get_json() or {}
    
    principal = float(data.get('loan_amount', 1000000))
    annual_rate = float(data.get('annual_interest_rate', 8.5))
    tenure_months = int(data.get('tenure_months', 60))
    fee_pct = float(data.get('processing_fee_pct', 1.0))
    ins_pct = float(data.get('insurance_rate_pct', 0.5))
    doc_charges = float(data.get('doc_charges', 1500.0))
    
    if principal <= 0 or tenure_months <= 0 or annual_rate <= 0:
        return jsonify({'error': 'Principal, interest rate, and tenure must be positive numbers'}), 400
        
    monthly_rate = (annual_rate / 100) / 12
    emi = (principal * monthly_rate * ((1 + monthly_rate) ** tenure_months)) / (((1 + monthly_rate) ** tenure_months) - 1)
    
    total_repayment = emi * tenure_months
    total_interest = total_repayment - principal
    
    proc_fee = round(principal * (fee_pct / 100), 2)
    gst_on_fee = round(proc_fee * 0.18, 2)
    insurance_charge = round(principal * (ins_pct / 100), 2)
    
    total_upfront_fees = round(proc_fee + gst_on_fee + insurance_charge + doc_charges, 2)
    net_disbursed_amount = round(principal - total_upfront_fees, 2)
    total_cost_of_borrowing = round(total_repayment + total_upfront_fees, 2)
    
    # Effective Annual Percentage Rate (APR) estimation accounting for upfront fee deduction
    # Using annualized internal cost approximation
    tenure_years = tenure_months / 12
    fee_impact_annual = (total_upfront_fees / principal) / tenure_years * 100 * 0.65
    effective_apr = round(annual_rate + fee_impact_annual, 2)
    
    # Generate Amortization Schedule (yearly summary + first 24 months detailed)
    balance = principal
    schedule_months = []
    yearly_summary = {}
    
    for m in range(1, tenure_months + 1):
        interest_payment = balance * monthly_rate
        principal_payment = emi - interest_payment
        balance = max(0.0, balance - principal_payment)
        
        year = (m - 1) // 12 + 1
        if year not in yearly_summary:
            yearly_summary[year] = {
                'year': year,
                'principal_paid': 0.0,
                'interest_paid': 0.0,
                'total_paid': 0.0,
                'ending_balance': round(balance, 2)
            }
        yearly_summary[year]['principal_paid'] += principal_payment
        yearly_summary[year]['interest_paid'] += interest_payment
        yearly_summary[year]['total_paid'] += emi
        yearly_summary[year]['ending_balance'] = round(balance, 2)
        
        if m <= 36 or m == tenure_months:
            schedule_months.append({
                'month': m,
                'emi': round(emi, 2),
                'principal_payment': round(principal_payment, 2),
                'interest_payment': round(interest_payment, 2),
                'remaining_balance': round(balance, 2)
            })
            
    yearly_list = [
        {
            'year': v['year'],
            'principal_paid': round(v['principal_paid'], 2),
            'interest_paid': round(v['interest_paid'], 2),
            'total_paid': round(v['total_paid'], 2),
            'ending_balance': round(v['ending_balance'], 2)
        }
        for v in yearly_summary.values()
    ]
    
    # Pie chart distribution breakdown
    pie_breakdown = [
        {'name': 'Principal Loan Amount', 'value': round(principal, 2), 'color': '#3b82f6'},
        {'name': 'Total Interest', 'value': round(total_interest, 2), 'color': '#ef4444'},
        {'name': 'Processing Fee + GST', 'value': round(proc_fee + gst_on_fee, 2), 'color': '#f59e0b'},
        {'name': 'Loan Insurance', 'value': round(insurance_charge, 2), 'color': '#10b981'},
        {'name': 'Doc & Admin Charges', 'value': round(doc_charges, 2), 'color': '#8b5cf6'}
    ]
    
    return jsonify({
        'loan_amount': round(principal, 2),
        'annual_interest_rate': annual_rate,
        'tenure_months': tenure_months,
        'monthly_emi': round(emi, 2),
        'total_interest': round(total_interest, 2),
        'processing_fee': proc_fee,
        'gst_on_fee': gst_on_fee,
        'insurance_charge': insurance_charge,
        'doc_charges': doc_charges,
        'total_upfront_fees': total_upfront_fees,
        'net_disbursed_amount': net_disbursed_amount,
        'total_cost_of_borrowing': total_cost_of_borrowing,
        'effective_apr': effective_apr,
        'pie_breakdown': pie_breakdown,
        'yearly_summary': yearly_list,
        'monthly_schedule': schedule_months
    }), 200
