from flask import Blueprint, request, jsonify
from app.ml.predictor import predict_loan_approval

predict_bp = Blueprint('predict', __name__, url_prefix='/api/v1/predict')

@predict_bp.route('/approval', methods=['POST'])
def predict_approval():
    try:
        data = request.get_json() or {}
        result = predict_loan_approval(data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
