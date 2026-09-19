from flask import Blueprint, request, jsonify
from app.models import BankProduct

banks_bp = Blueprint('banks', __name__, url_prefix='/api/v1/banks')

@banks_bp.route('', methods=['GET'])
def get_banks():
    category = request.args.get('category')
    query = BankProduct.query
    if category and category != 'All':
        query = query.filter_by(loan_category=category)
    banks = query.all()
    return jsonify({'banks': [b.to_dict() for b in banks]}), 200

@banks_bp.route('/<int:bank_id>', methods=['GET'])
def get_bank(bank_id):
    bank = BankProduct.query.get(bank_id)
    if not bank:
        return jsonify({'error': 'Bank product not found'}), 404
    return jsonify({'bank': bank.to_dict()}), 200
