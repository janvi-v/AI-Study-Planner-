let subjectCount = 0;


function addSubject() {

    subjectCount++;

    const container =
        document.getElementById("subjects");

    const div =
        document.createElement("div");

    div.className = "subject";

    div.id = `subject-${subjectCount}`;

    div.innerHTML = `

        <div class="subject-grid">

            <div>

                <label>Subject name</label>

                <input
                    type="text"
                    class="subject-name"
                    placeholder="Eg: Data Structures"
                >

            </div>


            <div>

                <label>Exam date</label>

                <input
                    type="date"
                    class="exam-date"
                >

            </div>


            <div>

                <label>Difficulty (1-10)</label>

                <input
                    type="number"
                    class="difficulty"
                    min="1"
                    max="10"
                    value="5"
                >

            </div>


            <div>

                <label>
                    Preparation level (%)
                </label>

                <input
                    type="number"
                    class="preparation"
                    min="0"
                    max="100"
                    value="50"
                >

            </div>

        </div>


        <button
            class="remove"
            onclick="removeSubject(${subjectCount})">

            Remove

        </button>

    `;

    container.appendChild(div);
}


function removeSubject(id) {

    const element =
        document.getElementById(`subject-${id}`);

    if (element) {
        element.remove();
    }

}


async function generatePlan() {

    const studyHours =
        document.getElementById("studyHours").value;

    const names =
        document.querySelectorAll(".subject-name");

    const dates =
        document.querySelectorAll(".exam-date");

    const difficulties =
        document.querySelectorAll(".difficulty");

    const preparations =
        document.querySelectorAll(".preparation");


    let subjects = [];


    for (let i = 0; i < names.length; i++) {

        if (!names[i].value || !dates[i].value) {

            alert(
                "Please enter subject name and exam date."
            );

            return;
        }


        subjects.push({

            name: names[i].value,

            exam_date: dates[i].value,

            difficulty: difficulties[i].value,

            preparation: preparations[i].value

        });

    }


    if (subjects.length === 0) {

        alert("Please add at least one subject.");

        return;

    }


    document
        .getElementById("loading")
        .classList.remove("hidden");


    document
        .getElementById("result")
        .classList.add("hidden");


    try {

        const response =
            await fetch("/generate", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    study_hours:
                        studyHours,

                    subjects:
                        subjects

                })

            });


        const data =
            await response.json();


        if (!data.success) {

            alert(data.error);

            return;

        }


        displayPlan(data.plan);


    }

    catch (error) {

        alert(
            "Something went wrong. Please try again."
        );

    }

    finally {

        document
            .getElementById("loading")
            .classList.add("hidden");

    }

}


function displayPlan(plan) {

    const container =
        document.getElementById("plan");

    container.innerHTML = "";


    plan.forEach((item, index) => {

        const div =
            document.createElement("div");

        div.className = "plan-item";


        div.innerHTML = `

            <h3>
                ${index + 1}. ${item.subject}
            </h3>

            <p>
                ⏱️ <strong>
                ${item.hours} hours
                </strong>
            </p>

            <p>
                📖 ${item.recommendation}
            </p>

            <p class="priority">
                AI Priority Score:
                ${item.priority}
            </p>

        `;


        container.appendChild(div);

    });


    document
        .getElementById("result")
        .classList.remove("hidden");

}