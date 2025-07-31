from flask import Blueprint, jsonify
from services.template_service import TemplateService

template_bp = Blueprint('template', __name__)

@template_bp.route('/prompt-templates', methods=['GET'])
def prompt_template():
    """Get available prompt templates"""
    templates = TemplateService.get_prompt_templates()
    return jsonify({'templates': templates}), 200
