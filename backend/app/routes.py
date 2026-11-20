
from flask import Blueprint, request, jsonify
from app import db
from app.models import Lead
from email_validator import validate_email, EmailNotValidError
from sqlalchemy.exc import SQLAlchemyError


api = Blueprint("api", __name__)

ALLOWED_STATUSES = {"New", "Contacted", "Qualified", "Converted"}

ALLOWED_FIELDS = {
    "name", "email", "phone", "company", "source", "status"
}

REQUIRED_FIELDS = {"name", "email", "phone"}


def validate_lead_data(data, existing_lead=None):
    """Validate and normalize lead information."""

    if not isinstance(data, dict):
        return None, "Request data must be a JSON object"

    if not data:
        return None, "Request data is required"

    unknown_fields = set(data.keys()) - ALLOWED_FIELDS
    if unknown_fields:
        return None, f"Unknown fields: {', '.join(unknown_fields)}"

    cleaned = {}

    # Validate required fields
    for field in REQUIRED_FIELDS:
        if existing_lead and field not in data:
            cleaned[field] = getattr(existing_lead, field)
            continue

        value = data.get(field)

        if not isinstance(value, str) or not value.strip():
            return None, f"{field} is required"

        cleaned[field] = value.strip()

    # Validate email
    try:
        email_result = validate_email(
            cleaned["email"],
            check_deliverability=False
        )
        cleaned["email"] = email_result.normalized.lower()
    except EmailNotValidError:
        return None, "Please enter a valid email address"

    # Validate optional fields
    for field in ["company", "source"]:
        if field in data:
            value = data[field]

            if value is None:
                value = ""

            if not isinstance(value, str):
                return None, f"{field} must be text"

            cleaned[field] = value.strip()
        elif existing_lead:
            cleaned[field] = getattr(existing_lead, field) or ""
        else:
            cleaned[field] = ""

    # Validate status
    status = data.get(
        "status",
        existing_lead.status if existing_lead else "New"
    )

    if not isinstance(status, str) or status not in ALLOWED_STATUSES:
        return None, "Invalid status. Choose New, Contacted, Qualified, or Converted"

    cleaned["status"] = status

    return cleaned, None


def check_duplicate_email(email, lead_id=None):
    query = Lead.query.filter_by(email=email)

    if lead_id is not None:
        query = query.filter(Lead.id != lead_id)

    return query.first() is not None


# 1. Get all leads
@api.route("/leads", methods=["GET"])
def get_leads():
    try:
        leads = Lead.query.order_by(Lead.id.desc()).all()
        return jsonify([lead.to_dict() for lead in leads]), 200
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Unable to retrieve leads"}), 500


# 2. Add a new lead
@api.route("/leads", methods=["POST"])
def add_lead():
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json(silent=True)

    cleaned, error = validate_lead_data(data)

    if error:
        return jsonify({"error": error}), 400

    if check_duplicate_email(cleaned["email"]):
        return jsonify({"error": "Email already exists"}), 409

    try:
        new_lead = Lead(**cleaned)

        db.session.add(new_lead)
        db.session.commit()

        return jsonify({
            "message": "Lead created successfully",
            "lead": new_lead.to_dict()
        }), 201

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Unable to create lead"}), 500


# 3. Update a lead
@api.route("/leads/<int:lead_id>", methods=["PUT"])
def update_lead(lead_id):
    lead = db.session.get(Lead, lead_id)

    if not lead:
        return jsonify({"error": "Lead not found"}), 404

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json(silent=True)

    cleaned, error = validate_lead_data(data, existing_lead=lead)

    if error:
        return jsonify({"error": error}), 400

    if check_duplicate_email(cleaned["email"], lead_id):
        return jsonify({"error": "Email already exists"}), 409

    try:
        for field, value in cleaned.items():
            setattr(lead, field, value)

        db.session.commit()

        return jsonify({
            "message": "Lead updated successfully",
            "lead": lead.to_dict()
        }), 200

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Unable to update lead"}), 500


# 4. Delete a lead
@api.route("/leads/<int:lead_id>", methods=["DELETE"])
def delete_lead(lead_id):
    lead = db.session.get(Lead, lead_id)

    if not lead:
        return jsonify({"error": "Lead not found"}), 404

    try:
        db.session.delete(lead)
        db.session.commit()

        return jsonify({
            "message": "Lead deleted successfully"
        }), 200

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"error": "Unable to delete lead"}), 500
