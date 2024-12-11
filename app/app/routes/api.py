from flask import Blueprint, render_template, redirect

api_bp = Blueprint('api', __name__)

@api_bp.route('/')
def index():
    return render_template('index.html')

@api_bp.route('/<path:dummy>')
def fallback(dummy):
    # Redirect when the path is incorrect 
    return redirect('/')