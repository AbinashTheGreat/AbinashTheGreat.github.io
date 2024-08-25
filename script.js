// script.js

document.getElementById('addSubjectBtn').addEventListener('click', function () {
    const subjectsDiv = document.getElementById('subjects');
    const subjectTemplate = `
        <div class="subject">
            <label for="subjectName">Subject:</label>
            <input type="text" class="subjectName" required>

            <label for="theoryMarks">Theory Marks:</label>
            <input type="number" class="theoryMarks" required>

            <label for="practicalMarks">Practical Marks:</label>
            <input type="number" class="practicalMarks" required>
        </div>`;
    subjectsDiv.insertAdjacentHTML('beforeend', subjectTemplate);
});

document.getElementById('generateResultBtn').addEventListener('click', function () {
    const schoolName = document.getElementById('schoolName').value;
    const address = document.getElementById('address').value;
    const contact = document.getElementById('contact').value;
    const batchYear = document.getElementById('batchYear').value;

    const studentName = document.getElementById('studentName').value;
    const rollNumber = document.getElementById('rollNumber').value;
    const studentClass = document.getElementById('class').value;
    const section = document.getElementById('section').value;

    const activities = document.getElementById('activities').value;
    const remarks = document.getElementById('remarks').value;
    const attendance = document.getElementById('attendance').value;
    const issueDate = document.getElementById('issueDate').value;

    const subjects = document.querySelectorAll('.subject');
    let subjectDetails = '';
    let totalGradePoints = 0;
    subjects.forEach(subject => {
        const subjectName = subject.querySelector('.subjectName').value;
        const theoryMarks = parseFloat(subject.querySelector('.theoryMarks').value);
        const practicalMarks = parseFloat(subject.querySelector('.practicalMarks').value);
        const finalGrade = calculateGrade((theoryMarks + practicalMarks) / 2);
        const gradePoint = calculateGradePoint(finalGrade);

        totalGradePoints += gradePoint;

        subjectDetails += `
            <tr>
                <td>${subjectName}</td>
                <td>${theoryMarks}</td>
                <td>${practicalMarks}</td>
                <td>${finalGrade}</td>
                <td>${gradePoint.toFixed(1)}</td>
            </tr>`;
    });

    const gpa = (totalGradePoints / subjects.length).toFixed(2);

    const resultCardHTML = `
        <h2>${schoolName}</h2>
        <p>${address}</p>
        <p>${contact}</p>
        <p>Batch Year: ${batchYear}</p>

        <h3>Student Information</h3>
        <p>Name: ${studentName}</p>
        <p>Roll Number: ${rollNumber}</p>
        <p>Class: ${studentClass}</p>
        <p>Section: ${section}</p>

        <h3>Grades</h3>
        <table>
            <thead>
                <tr>
                    <th>Subject</th>
                    <th>Theory Marks</th>
                    <th>Practical Marks</th>
                    <th>Final Grade</th>
                    <th>Grade Point</th>
                </tr>
            </thead>
            <tbody>
                ${subjectDetails}
            </tbody>
        </table>

        <p><strong>Total GPA:</strong> ${gpa}</p>
        <p><strong>Remarks:</strong> ${remarks}</p>
        <p><strong>Attendance:</strong> ${attendance}</p>
        <p><strong>Issue Date:</strong> ${issueDate}</p>
    `;

    document.getElementById('resultCard').innerHTML = resultCardHTML;
});

function calculateGrade(averageMarks) {
    if (averageMarks >= 90) return 'A+';
    if (averageMarks >= 80) return 'A';
    if (averageMarks >= 70) return 'B+';
    if (averageMarks >= 60) return 'B';
    if (averageMarks >= 50) return 'C+';
    if (averageMarks >= 40) return 'C';
    return 'D';
}

function calculateGradePoint(grade) {
    switch (grade) {
        case 'A+': return 4.0;
        case 'A': return 3.8;
        case 'B+': return 3.4;
        case 'B': return 3.0;
        case 'C+': return 2.6;
        case 'C': return 2.4;
        default: return 2.0;
    }
}

document.getElementById('downloadPDF').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Generate the PDF using HTML content
    doc.html(document.getElementById('resultCard'), {
        callback: function (doc) {
            doc.save(`${document.getElementById('studentName').value}_Result.pdf`);
        },
        x: 10,
        y: 10
    });
});
