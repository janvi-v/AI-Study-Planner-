from flask import Flask, render_template, request, jsonify
from datetime import datetime
import math

app = Flask(__name__)


def calculate_priority(subject):
    """
    AI-style priority calculation.

    Higher priority =
    - Exam is closer
    - Subject is harder
    - Student preparation is lower
    """

    exam_date = datetime.strptime(subject["exam_date"], "%Y-%m-%d")
    today = datetime.today()

    days_left = max((exam_date - today).days, 1)

    difficulty = int(subject["difficulty"])
    preparation = int(subject["preparation"])

    urgency_score = 10 / days_left
    difficulty_score = difficulty / 2
    weakness_score = (10 - preparation) / 2

    priority = (
        urgency_score * 5
        + difficulty_score * 2
        + weakness_score * 3
    )

    return priority


def generate_plan(data):

    subjects = data["subjects"]
    study_hours = float(data["study_hours"])

    # Calculate AI priority
    for subject in subjects:
        subject["priority"] = calculate_priority(subject)

    # Sort subjects according to priority
    subjects.sort(
        key=lambda x: x["priority"],
        reverse=True
    )

    total_priority = sum(
        subject["priority"] for subject in subjects
    )

    plan = []

    for subject in subjects:

        # Allocate time according to priority
        allocated_hours = (
            subject["priority"] / total_priority
        ) * study_hours

        allocated_hours = max(
            0.5,
            round(allocated_hours * 2) / 2
        )

        preparation = int(subject["preparation"])

        if preparation < 40:
            recommendation = "Focus on learning concepts"
        elif preparation < 70:
            recommendation = "Practice problems and revise"
        else:
            recommendation = "Take a quick revision test"

        plan.append({
            "subject": subject["name"],
            "hours": allocated_hours,
            "recommendation": recommendation,
            "priority": round(subject["priority"], 2)
        })

    # Normalize total hours
    total_allocated = sum(item["hours"] for item in plan)

    if total_allocated > study_hours:
        difference = total_allocated - study_hours

        for item in reversed(plan):
            if difference <= 0:
                break

            if item["hours"] > 0.5:
                item["hours"] -= 0.5
                difference -= 0.5

    return plan


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No data received"
            }), 400

        plan = generate_plan(data)

        return jsonify({
            "success": True,
            "plan": plan
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)